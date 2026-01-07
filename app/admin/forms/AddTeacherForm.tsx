// app/routes/adminPanel/forms/AddTeacherForm.tsx
import { useState } from "react";
import { api } from "~/utils/serviceAPI";
import styles from "./Form.module.css";

interface AddTeacherFormProps {
  onSuccess: () => void;
}

export default function AddTeacherForm({ onSuccess }: AddTeacherFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    // Walidacja przed wysłaniem
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

    if (!formData.password.trim() || formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    console.log("📤 Attempting to create teacher:", {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
    });

    try {
      // Sprawdź czy użytkownik jest zalogowany przed wysłaniem
      if (!api.isAuthenticated()) {
        throw new Error("You are not authenticated. Please log in again.");
      }

      // Sprawdź czy użytkownik jest adminem
      if (!api.isAdmin()) {
        throw new Error("You don't have admin permissions.");
      }

      const response = await api.post("/accounts/teacher", formData);
      
      console.log("✅ Teacher created successfully:", response);
      
      setSuccess(true);
      
      // Wyczyść formularz
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });

      // Pokaż komunikat sukcesu
      setTimeout(() => {
        alert("Teacher added successfully!");
        onSuccess();
      }, 500);

    } catch (err: any) {
      console.error("❌ Failed to create teacher:", err);
      
      // Szczegółowa obsługa błędów
      if (err.status === 401 || err.status === 403) {
        setError("Session expired or insufficient permissions. Please log in again.");
        
        // Opcjonalnie: przekieruj do logowania po 2 sekundach
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else if (err.status === 400) {
        setError(err.data?.message || "Invalid data. Please check your input.");
      } else if (err.status === 409) {
        setError("Teacher with this email already exists.");
      } else {
        setError(err.message || "Failed to add teacher. Please try again.");
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
    // Wyczyść błąd gdy użytkownik zaczyna pisać
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
          <strong>Success!</strong> Teacher has been added successfully.
        </div>
      )}

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
          placeholder="teacher@example.com"
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
      </div>

      <button 
        type="submit" 
        disabled={isLoading} 
        className={styles.submitButton}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner}></span>
            Adding...
          </>
        ) : (
          "Add Teacher"
        )}
      </button>
    </form>
  );
}