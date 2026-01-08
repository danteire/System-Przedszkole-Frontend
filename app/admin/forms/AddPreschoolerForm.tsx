// app/routes/adminPanel/forms/AddPreschoolerForm.tsx
import { useState } from "react";
import { api } from "~/utils/serviceAPI";
import styles from "./Form.module.css";
import { p } from "node_modules/@react-router/dev/dist/routes-CZR-bKRt";
import { group } from "console";
import groups from "~/groups/groups";

interface AddPreschoolerFormProps {
  onSuccess: () => void;
}

interface PreschoolerFormData {
  firstName: string;
  lastName: string;
  parentId?: number;
  groupId?: number;
}

export default function AddPreschoolerForm({ onSuccess }: AddPreschoolerFormProps) {
  const [formData, setFormData] = useState<PreschoolerFormData>({
    firstName: "",
    lastName: "",
    parentId: undefined,
    groupId: undefined,
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

    if (!formData.parentId) {
      setError("Parent is required");
      setIsLoading(false);
      return;
    }

    // Walidacja parentId

    if (formData.parentId && isNaN(formData.parentId)) {
      setError("Please enter a valid parent ID");
      setIsLoading(false);
      return;
    }

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
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        parentId: formData.parentId,
        groupId: formData.groupId,
      });

      console.log("✅ Preschooler created successfully:", response);

      setSuccess(true);

      // Wyczyść formularz
      setFormData({
        firstName: "",
        lastName: "",
        parentId: undefined,
        groupId: undefined,
      });

      // Pokaż sukces i zamknij po 1.5 sekundy
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err: any) {
      console.error("❌ Failed to create Preschooler:", err);

      if (err.status === 401 || err.status === 403) {
        setError("Session expired or insufficient permissions. Please log in again.");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else if (err.status === 400) {
        setError(err.data?.message || "Invalid data. Please check your input.");
      } else if (err.status === 409) {
        setError("Preschooler with this email already exists.");
      } else {
        setError(err.message || "Failed to add Preschooler. Please try again.");
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

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value ? Number(e.target.value) : undefined,
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
          <strong>Success!</strong> Preschooler has been added successfully.
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
            placeholder="Enter first name of Preschooler"
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
            placeholder="Enter last name of Preschooler"
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Parent Email *
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
          placeholder="parent@example.com"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="groupId" className={styles.label}>
          Group *
        </label>
        <select
          id="groupId"
          name="groupId"
          value={formData.groupId}
          onChange={handleSelectChange}
          required
          disabled={isLoading}
          className={styles.input}
        >
          <option value="">Select a group</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          Account Type
        </label>
        <div className={styles.readonlyField}>
          Preschooler
        </div>
        <small className={styles.hint}>
          Account type is automatically set to Preschooler
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
            Adding Preschooler...
          </>
        ) : (
          "Add Preschooler"
        )}
      </button>
    </form>
  );
}