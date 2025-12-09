// utils/ApiClient.ts

interface TokenResponse {
  accessToken: string;
}

interface ApiError {
  message: string;
  status: number;
  data?: any;
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private isRefreshing: boolean = false;
  private failedQueue: Array<{
    resolve: (value: string) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage(): void {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      console.log('📥 Loaded token from storage:', this.accessToken ? 'Token exists' : 'No token found');
    }
  }

  private saveToken(accessToken: string): void {
    this.accessToken = accessToken;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      console.log('💾 Token saved to storage: ', this.accessToken);
    }
  }

  private clearToken(): void {
    this.accessToken = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      console.log('🗑️ Token cleared from storage');
    }
  }

  private async logErrorResponse(response: Response, endpoint: string, method: string): Promise<void> {
    let errorData: any = null;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.clone().json(); 
      } else {
        errorData = await response.clone().text();
      }
    } catch (e) {
      errorData = 'Could not parse error response';
    }

    console.group(`❌ HTTP ${response.status} Error`);
    console.error('Endpoint:', `${method} ${endpoint}`);
    console.error('Status:', response.status);
    console.error('Status Text:', response.statusText);
    console.error('Response Data:', errorData);
    console.groupEnd();
  }

  private async createError(response: Response, endpoint: string, method: string): Promise<ApiError> {
    let errorData: any = null;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.clone().json(); // ← clone()
      } else {
        errorData = await response.clone().text();
      }
    } catch (e) {
      errorData = null;
    }

    const error: ApiError = {
      message: errorData?.message || errorData || `HTTP ${response.status}: ${response.statusText}`,
      status: response.status,
      data: errorData,
    };

    return error;
  }

  private getHeaders(customHeaders?: HeadersInit): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Dodaj custom headers
    if (customHeaders) {
      if (customHeaders instanceof Headers) {
        customHeaders.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(customHeaders)) {
        customHeaders.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, customHeaders);
      }
    }

    // Dodaj Authorization Bearer token
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
      console.log('🔐 Added Authorization header with token');
    } else {
      console.warn('⚠️ No access token available for Authorization header');
    }

    return headers;
  }

  private async refreshAccessToken(): Promise<string> {
    console.log('🔄 Refreshing access token...');

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        await this.logErrorResponse(response, '/auth/refresh', 'POST');
        throw new Error('Failed to refresh token');
      }

      const data: TokenResponse = await response.json();
      
      console.log('✅ Token refreshed successfully');
      
      this.saveToken(data.accessToken);
      
      return data.accessToken;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      
      this.clearToken();
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      throw error;
    }
  }

  private processQueue(error: any = null, token: string | null = null): void {
    this.failedQueue.forEach(promise => {
      if (error) {
        promise.reject(error);
      } else if (token) {
        promise.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(options.headers);
    const method = options.method || 'GET';

    console.log(`📤 Request: ${method} ${endpoint}`);
    console.log('📋 Request headers:', headers);

    try {
      let response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (response.status === 401) {
        console.log('⚠️ 401 Unauthorized - Token expired');

        if (!this.isRefreshing) {
          this.isRefreshing = true;

          try {
            const newAccessToken = await this.refreshAccessToken();
            
            this.isRefreshing = false;
            
            this.processQueue(null, newAccessToken);

            console.log(`🔄 Retrying request: ${method} ${endpoint}`);
            
            const newHeaders = this.getHeaders(options.headers);
            response = await fetch(url, {
              ...options,
              headers: newHeaders,
              credentials: 'include',
            });

          } catch (refreshError) {
            this.isRefreshing = false;
            this.processQueue(refreshError, null);
            throw refreshError;
          }
        } else {
          console.log('⏳ Waiting for token refresh...');

          const newAccessToken = await new Promise<string>((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          });

          console.log(`🔄 Retrying queued request: ${method} ${endpoint}`);

          const newHeaders = this.getHeaders(options.headers);
          response = await fetch(url, {
            ...options,
            headers: newHeaders,
            credentials: 'include',
          });
        }
      }

      if (response.status === 401) {
        console.error('❌ Still 401 after refresh - Logging out');
        await this.logErrorResponse(response, endpoint, method);
        
        this.clearToken();
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        await this.logErrorResponse(response, endpoint, method);
        const error = await this.createError(response, endpoint, method);
        throw error;
      }

      console.log(`✅ Response: ${method} ${endpoint} - ${response.status}`);
      
      const contentLength = response.headers.get('content-length');
      if (contentLength === '0' || response.status === 204) {
        return {} as T;
      }
      
      return response.json();

    } catch (error) {
      if (error instanceof TypeError) {
        console.group('❌ Network Error');
        console.error('Endpoint:', `${method} ${endpoint}`);
        console.error('Error:', error.message);
        console.error('Possible causes: Network timeout, CORS, or server is down');
        console.groupEnd();
      }
      
      throw error;
    }
  }

  // ============================================
  // PUBLICZNE METODY HTTP
  // ============================================

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  async login(credentials: { email: string; password: string }): Promise<TokenResponse> {
    console.log('🔐 Logging in...');

    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      if (!response.ok) {
        await this.logErrorResponse(response, '/auth/login', 'POST');
        const error = await this.createError(response, '/auth/login', 'POST');
        throw error;
      }

      const data: TokenResponse = await response.json();
      
      this.saveToken(data.accessToken);
      console.log('✅ Login successful - Token saved');
      
      return data;
    } catch (error) {
      console.error('❌ Login failed');
      throw error;
    }
  }

  async logout(): Promise<void> {
    console.log('🚪 Logging out...');

    try {
      const response = await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        await this.logErrorResponse(response, '/auth/logout', 'POST');
      }
    } catch (error) {
      console.error('❌ Logout request failed:', error);
    } finally {
      this.clearToken();
      
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      
      console.log('✅ Logged out');
    }
  }

  isAuthenticated(): boolean {
    const isAuth = !!this.accessToken;
    console.log('🔍 isAuthenticated:', isAuth);
    return isAuth;
  }

  getAccessToken(): string | null {
    console.log('🔑 Current access token:', this.accessToken ? 'Token exists' : 'No token');
    return this.accessToken;
  }
}

export const api = new ApiClient('https://przedszkoleplus.mywire.org/api');