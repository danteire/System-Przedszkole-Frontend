// app/routes/adminPanel/forms/AddAccountForm.tsx
import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import styles from "./Form.module.css";

interface AddAccountFormProps {
  onSuccess: () => void;
}

interface AccountFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  accountType: string;
}

type AccountType = "TEACHER" | "ADMIN" | "PARENT";

const endpointMap: Record<AccountType, string> = {
        TEACHER: "teacher",
        ADMIN: "admin",
        PARENT: "parent",
};



export default function AddAccountForm({ onSuccess }: AddAccountFormProps) {
  const [formData, setFormData] = useState<AccountFormData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    accountType: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailList, setEmailList] = useState<string[]>([]);
  const accountTypes: { value: AccountType; label: string; description: string }[] = [
    { 
      value: "TEACHER", 
      label: "Teacher", 
      description: "Can manage classes and student attendance" 
    },
    { 
      value: "ADMIN", 
      label: "Administrator", 
      description: "Full access to all system features" 
    },
    { 
      value: "PARENT", 
      label: "Parent", 
      description: "Can view their children's information" 
    },
  ];

    useEffect(() => {
        getEmailList().then(emails => setEmailList(emails));
    }, []);  
    
    console.log("📧 Fetched email list for validation:", emailList);

    
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    // Walidacja
    if (!formData.firstName.trim()) {
      setError("First name is required");
      setIsLoading(false);
      return;
    }

    if (!formData.lastName.trim()) {
      setError("Last name is required");
      setIsLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    if (emailList.includes(formData.email.toLowerCase())) {
      setError("An account with this email already exists.");
      setIsLoading(false);
      return;
    }

    if (!formData.password.trim() || formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (!formData.accountType) {
      setError("Please select an account type");
      setIsLoading(false);
      return;
    }

    console.log("📤 Creating account with data:", {
      ...formData,
      password: "***hidden***",
    });

    try {
      if (!api.isAuthenticated()) {
        throw new Error("You are not authenticated. Please log in again.");
      }

      if (!api.isAdmin()) {
        throw new Error("You don't have admin permissions.");
      }

      const endpoint = endpointMap[formData.accountType as AccountType];
      
      console.log(`📤 Sending POST to /accounts/${endpoint}`);

      const response = await api.post(`/accounts`, {
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        accountType: formData.accountType,
      });

      console.log("✅ Account created successfully:", response);

      setSuccess(true);

      // Wyczyść formularz
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        accountType: "TEACHER",
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err: any) {
      console.error("❌ Failed to create account:", err);

      if (err.status === 401) {
        setError("Access denied. You don't have permission to create accounts.");
      } 
      else if (err.status === 403) {
        setError("Your session has expired. Redirecting to login...");
      } 
      else if (err.status === 400) {
        setError(err.data?.message || "Invalid data. Please check your input.");
      } 
      else if (err.status === 409) {
        setError("An account with this email already exists.");
      } 
      else {
        setError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    console.log("🔄 Form data updated:", {
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(null);
  };

  const getAccountTypeDescription = (type: string) => {
    return accountTypes.find(at => at.value === type)?.description || "";
  };

  const getAccountTypeLabel = (type: string) => {
    const accountType = accountTypes.find(at => at.value === type);
    return accountType?.label || "Account";
  };


  async function getEmailList(): Promise<string[]> {
    interface AccountDTO {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        accountType: string;
    }
    try {
        const response = await api.get<AccountDTO[]>("/accounts");
        return response.map((account: AccountDTO) => account.email);
    } catch (err) {
        console.error("❌ Failed to fetch email list:", err);
        return [];
    }



  }
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && (
        <div className={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className={styles.success}>
          <strong>Success!</strong> Account has been created successfully.
        </div>
      )}

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="firstName" className={styles.label}>
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            disabled={isLoading}
            className={styles.input}
            placeholder="Enter first name"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="lastName" className={styles.label}>
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            disabled={isLoading}
            className={styles.input}
            placeholder="Enter last name"
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isLoading}
          className={styles.input}
          placeholder="user@example.com"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.label}>
          Password * (min. 6 characters)
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={isLoading}
          minLength={6}
          className={styles.input}
          placeholder="Enter password"
        />
        <small className={styles.hint}>
          Password will be securely hashed by the server
        </small>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="accountType" className={styles.label}>
          Account Type *
        </label>
        <select
          id="accountType"
          name="accountType"
          value={formData.accountType}
          onChange={handleChange}
          required
          disabled={isLoading}
          className={styles.select}
        >
          {accountTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <small className={styles.hint}>
          {getAccountTypeDescription(formData.accountType)}
        </small>
      </div>

      {formData.accountType === "ADMIN" && (
        <div className={styles.warning}>
          <strong>⚠️ Warning:</strong> You are creating an admin account with full system access. 
          Make sure this is intended.
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={styles.submitButton}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner}></span>
            Creating {getAccountTypeLabel(formData.accountType)}...
          </>
        ) : (
          `Create ${getAccountTypeLabel(formData.accountType)} Account`
        )}
      </button>
    </form>
  );
}