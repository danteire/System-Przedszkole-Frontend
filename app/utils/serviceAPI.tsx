// utils/ApiClient.ts
interface AccountInfo {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  accountType: string;
}

interface TokenResponse {
  accessToken: string;
  account: AccountInfo;
}

interface ApiError {
  message: string;
  status: number;
  data?: any;
}

class ApiClient {
  private baseUrl: string;
  public readonly apiUrl: string; // Expose if needed, but better use helpers
  private accessToken: string | null = null;
  private accountInfo: AccountInfo | null = null; // ← Przechowuj w pamięci
  private isRefreshing: boolean = false;
  private failedQueue: Array<{
    resolve: (value: string) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.apiUrl = baseUrl;
    this.loadFromStorage(); // ← Załaduj WSZYSTKO przy starcie
  }

  // Helpery do obrazków
  getMealImageUrl(path: string | undefined): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('https')) return path; // Jeśli to pełny URL
    return `${this.baseUrl}/meals/image/${path}`;
  }

  getAnnouncementImageUrl(path: string | undefined): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('https')) return path;
    return `${this.baseUrl}/announcements/image/${path}`;
  }

  // ============================================
  // OBSŁUGA OBRAZÓW (Secure Fetch)
  // ============================================

  /**
   * PRYWATNA metoda pomocnicza - "silnik" do pobierania obrazków.
   * * @param path - nazwa pliku (np. "pizza.jpg")
   * @param endpointPrefix - prefiks endpointu API (np. "/meals/image" lub "/announcements/image")
   */
  private async _fetchSecureImage(path: string | undefined, endpointPrefix: string): Promise<string | null> {
    if (!path) return null;

    // 1. Jeśli to zewnętrzny link, zwróć go bez zmian
    if (path.startsWith('http') || path.startsWith('https')) {
      return path;
    }

    // 2. Wyczyść ścieżkę (usuń początkowy slash, jeśli jest)
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    // 3. Zbuduj pełny endpoint
    const endpoint = `${endpointPrefix}/${cleanPath}`;

    try {
      // 4. Pobierz Blob z autoryzacją
      const blob = await this.download(endpoint);

      // 5. Utwórz URL
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error(`❌ Failed to load image from ${endpoint}:`, error);
      return null;
    }
  }

  /**
   * Publiczna metoda dla Ogłoszeń (zrefaktoryzowana)
   * Endpoint w Springu: @RequestMapping("/announcements") + @GetMapping("/image/{path}")
   */
  async getAnnouncementImage(path: string | undefined): Promise<string | null> {
    return this._fetchSecureImage(path, '/announcements/image');
  }

  /**
   * NOWA Metoda (np. dla Posiłków lub innego kontrolera)
   * Zakładając, że Twój nowy endpoint znajduje się w kontrolerze zmapowanym na "/meals"
   * Endpoint w Springu: @RequestMapping("/meals") + @GetMapping("/image/{path}")
   */
  async getMealImage(path: string | undefined): Promise<string | null> {
    return this._fetchSecureImage(path, '/meals/image');
  }

  /**
   * Zwalnianie pamięci (bez zmian)
   */
  revokeImage(url: string | null | undefined): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  // ============================================
  // ZARZĄDZANIE TOKENEM I KONTEM
  // ============================================

  /**
   * Ładuje token i informacje o koncie z localStorage
   */
  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      // Załaduj token
      this.accessToken = localStorage.getItem('accessToken');
      console.log('📥 Loaded token from storage:', this.accessToken ? 'Token exists' : 'No token found');

      // Załaduj informacje o koncie
      const accountJson = localStorage.getItem('account');
      if (accountJson) {
        try {
          this.accountInfo = JSON.parse(accountJson);
          console.log('📥 Loaded account info:', this.accountInfo);
        } catch (error) {
          console.error('❌ Failed to parse account info:', error);
          this.accountInfo = null;
        }
      } else {
        console.log('📥 No account info found in storage');
      }
    }
  }

  private saveToken(accessToken: string): void {
    this.accessToken = accessToken;

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      console.log('💾 Token saved to storage');
    }
  }

  private clearToken(): void {
    this.accessToken = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      console.log('🗑️ Token cleared from storage');
    }
  }

  /**
   * Zapisuje informacje o koncie
   */
  private saveAccountInfo(accountInfo: AccountInfo): void {
    this.accountInfo = accountInfo; // ← Zapisz w pamięci

    if (typeof window !== 'undefined') {
      localStorage.setItem('account', JSON.stringify(accountInfo));
      console.log('💾 Account info saved:', {
        email: accountInfo.email,
        accountType: accountInfo.accountType,
        id: accountInfo.id
      });
    }
  }

  /**
   * Czyści informacje o koncie
   */
  private clearAccountInfo(): void {
    this.accountInfo = null; // ← Wyczyść z pamięci

    if (typeof window !== 'undefined') {
      localStorage.removeItem('account');
      console.log('🗑️ Account info cleared from storage');
    }
  }

  // ============================================
  // OBSŁUGA BŁĘDÓW
  // ============================================

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
        errorData = await response.clone().json();
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

  // ============================================
  // NAGŁÓWKI
  // ============================================

  private getHeaders(customHeaders?: HeadersInit): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

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

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
      console.log('🔐 Added Authorization header with token');
    } else {
      console.warn('⚠️ No access token available for Authorization header');
    }

    return headers;
  }

  // ============================================
  // REFRESH TOKEN
  // ============================================

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
      this.saveAccountInfo(data.account); // ← Zapisz też nowe info o koncie

      return data.accessToken;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);

      this.clearToken();
      this.clearAccountInfo();

      if (typeof window !== 'undefined') {
        window.location.href = '/';
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

  // ============================================
  // REQUEST (ZMODYFIKOWANA)
  // ============================================

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    responseType: 'json' | 'blob' = 'json' // ← MODYFIKACJA: Dodano typ odpowiedzi
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(options.headers);
    const method = options.method || 'GET';

    // ← MODYFIKACJA: Obsługa FormData (Upload)
    // Jeśli wysyłamy plik, przeglądarka sama musi ustawić Content-Type z "boundary".
    // Musimy usunąć 'application/json' dodane przez getHeaders.
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    console.log(`📤 Request: ${method} ${endpoint}`);

    try {
      let response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      // 401 = Unauthorized
      if (response.status === 401) {
        console.log('⚠️ 401 Unauthorized - Access denied to this resource');
        await this.logErrorResponse(response, endpoint, method);
        const error = await this.createError(response, endpoint, method);
        throw error;
      }

      // 403 = Forbidden (Refresh Token Logic)
      if (response.status === 403) {
        console.log('⚠️ 403 Forbidden - Token expired or invalid');

        if (!this.isRefreshing) {
          this.isRefreshing = true;

          try {
            const newAccessToken = await this.refreshAccessToken();

            this.isRefreshing = false;
            this.processQueue(null, newAccessToken);

            console.log(`🔄 Retrying request: ${method} ${endpoint}`);

            const newHeaders = this.getHeaders(options.headers);
            // ← MODYFIKACJA: Ponowne usunięcie Content-Type przy retry
            if (options.body instanceof FormData) {
              delete newHeaders['Content-Type'];
            }

            response = await fetch(url, {
              ...options,
              headers: newHeaders,
              credentials: 'include',
            });

            if (response.status === 403) {
              // ... (reszta logiki błędu bez zmian)
              console.error('❌ Still 403 after refresh - Logging out');
              await this.logErrorResponse(response, endpoint, method);
              this.clearToken();
              this.clearAccountInfo();
              if (typeof window !== 'undefined') window.location.href = '/';
              throw new Error('Session expired');
            }

          } catch (refreshError) {
            // ... (reszta logiki błędu bez zmian)
            this.isRefreshing = false;
            this.processQueue(refreshError, null);
            this.clearToken();
            this.clearAccountInfo();
            if (typeof window !== 'undefined') window.location.href = '/';
            throw refreshError;
          }
        } else {
          // ... (kolejkowanie zapytań bez zmian)
          console.log('⏳ Waiting for token refresh...');
          await new Promise<string>((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          });

          console.log(`🔄 Retrying queued request: ${method} ${endpoint}`);
          const newHeaders = this.getHeaders(options.headers);
          // ← MODYFIKACJA: Ponowne usunięcie Content-Type przy retry z kolejki
          if (options.body instanceof FormData) {
            delete newHeaders['Content-Type'];
          }

          response = await fetch(url, {
            ...options,
            headers: newHeaders,
            credentials: 'include',
          });
        }
      }

      // Obsługa innych błędów
      if (!response.ok) {
        await this.logErrorResponse(response, endpoint, method);
        const error = await this.createError(response, endpoint, method);
        throw error;
      }

      console.log(`✅ Response: ${method} ${endpoint} - ${response.status}`);

      // ← MODYFIKACJA: Obsługa pobierania pliku (Blob)
      if (responseType === 'blob') {
        return response.blob() as unknown as T;
      }

      const contentLength = response.headers.get('content-length');
      if (contentLength === '0' || response.status === 204) {
        return {} as T;
      }

      return response.json();

    } catch (error) {
      // ... (obsługa błędów sieciowych bez zmian)
      if (error instanceof TypeError) {
        console.group('❌ Network Error');
        console.error('Endpoint:', `${method} ${endpoint}`);
        console.error('Error:', error.message);
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

  async upload<T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
    });
  }

  async download(endpoint: string, options?: RequestInit): Promise<Blob> {
    return this.request<Blob>(endpoint, {
      ...options,
      method: 'GET',
    }, 'blob'); // ← Przekazujemy flagę 'blob'
  }

  
  // ============================================
  // AUTENTYKACJA
  // ============================================

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
      this.saveAccountInfo(data.account);

      console.log('✅ Login successful');

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
      this.clearAccountInfo();

      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }

      console.log('✅ Logged out');
    }
  }


  isAdmin(): boolean {
    console.log('🔍 Checking admin status...');
    console.log('  - accountInfo:', this.accountInfo);
    console.log('  - accountType:', this.accountInfo?.accountType);

    const isAdmin = this.accountInfo?.accountType === 'ADMIN';
    console.log('  - isAdmin:', isAdmin);

    return isAdmin;
  }

  isTeacher(): boolean {
    return this.accountInfo?.accountType === 'TEACHER';
  }


  isParent(): boolean {
    return this.accountInfo?.accountType === 'PARENT';
  }


  getAccountType(): string | null {
    return this.accountInfo?.accountType || null;
  }

  getAccountInfo(): AccountInfo | null {
    return this.accountInfo;
  }


  isAuthenticated(): boolean {
    const isAuth = !!this.accessToken;
    console.log('🔍 isAuthenticated:', isAuth);
    return isAuth;
  }


  getAccessToken(): string | null {
    return this.accessToken;
  }
}

export const api = new ApiClient('https://przedszkoleplus.mywire.org/api');