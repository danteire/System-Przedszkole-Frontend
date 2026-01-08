// app/routes/adminPanel/forms/AddParentForm.tsx
import { useState } from "react";
import { api } from "~/utils/serviceAPI";
import styles from "./Form.module.css";

interface AddParentFormProps {
  onSuccess: () => void;
}

interface ParentFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  accountType: string;
}

export default function AddParentForm({ onSuccess }: AddParentFormProps) {
  const [formData, setFormData] = useState<ParentFormData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    accountType: "PARENT", // Stała wartość dla nauczyciela
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

    // Walidacja email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (!formData.password.trim() || formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    console.log("📤 Creating Parent with data:", {
      ...formData,
      password: "***hidden***", // Nie loguj hasła
    });

    try {
      // Sprawdź uprawnienia
      if (!api.isAuthenticated()) {
        throw new Error("You are not authenticated. Please log in again.");
      }

      if (!api.isAdmin()) {
        throw new Error("You don't have admin permissions.");
      }

      // Wyślij request - backend oczekuje dokładnie tych pól
      const response = await api.post("/accounts", {
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        accountType: formData.accountType,
      });

      console.log("✅ Parent created successfully:", response);

      setSuccess(true);

      // Wyczyść formularz
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        accountType: "PARENT",
      });

      // Pokaż sukces i zamknij po 1.5 sekundy
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err: any) {
      console.error("❌ Failed to create Parent:", err);

      if (err.status === 401 || err.status === 403) {
        setError("Session expired or insufficient permissions. Please log in again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else if (err.status === 400) {
        setError(err.data?.message || "Invalid data. Please check your input.");
      } else if (err.status === 409) {
        setError("Parent with this email already exists.");
      } else {
        setError(err.message || "Failed to add Parent. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && (
        <div className={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className={styles.success}>
          <strong>Success!</strong> Parent has been added successfully.
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
          placeholder="Parent@example.com"
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
          Password will be hashed by the server
        </small>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          Account Type
        </label>
        <div className={styles.readonlyField}>
          Parent
        </div>
        <small className={styles.hint}>
          Account type is automatically set to Parent
        </small>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={styles.submitButton}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner}></span>
            Adding Parent...
          </>
        ) : (
          "Add Parent"
        )}
      </button>
    </form>
  );
}