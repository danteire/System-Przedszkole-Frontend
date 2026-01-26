// app/routes/adminPanel/forms/AddPreschoolerForm.tsx
import { useEffect, useState } from "react";
import { api } from "~/utils/serviceAPI";
import styles from "./Form.module.css";
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

interface Parent{
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  accountType: string;
}

interface Group{
  id: number;
  groupName: string;
  mainCaretakerId: number;
}

export default function AddPreschoolerForm({ onSuccess }: AddPreschoolerFormProps) {
  const [formData, setFormData] = useState<PreschoolerFormData>({
    firstName: "",
    lastName: "",
    parentId: undefined,
    groupId: undefined,
  });

  const [parents, setParents] = useState<Parent[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(()=>{
    loadParents();
    loadGroups();
  }, []);

  const loadParents = async () => {
    setIsLoading(true);
    setError(null);
    try {
          if (!api.isAuthenticated()) {
            throw new Error("You are not authenticated. Please log in again.");
          }
    
          console.log("📤 Fetching Parents...");
    
          const response = await api.get<Parent[] | { data: Parent[] }>("/accounts/parents");
    
          console.log("✅ Parents fetched:", response);
    
          let accountsData: Parent[];
          if (Array.isArray(response)) {
            accountsData = response;
          } else if (response && 'data' in response && Array.isArray(response.data)) {
            accountsData = response.data;
          } else {
            console.error("Unexpected response format:", response);
            accountsData = [];
          }
    
          setParents(accountsData);
        } catch (err: any) {
          console.error("❌ Failed to load Parents:", err);
    
          // 401 = Unauthorized - brak dostępu
          if (err.status === 401) {
            setError("Access denied. You don't have permission to view Parents.");
          } 
          // Inne błędy
          else {
            setError(err.message || "Failed to load Parents");
          }
        } finally {
          setIsLoading(false);
        }
  }

  const loadGroups = async () => {
    setIsLoading(true);
    setError(null);
    try {
          if (!api.isAuthenticated()) {
            throw new Error("You are not authenticated. Please log in again.");
          }
    
          console.log("📤 Fetching Parents...");
    
          const response = await api.get<Group[] | { data: Group[] }>("/groups");
    
          console.log("✅ Groups fetched:", response);
    
          let accountsData: Group[];
          if (Array.isArray(response)) {
            accountsData = response;
          } else if (response && 'data' in response && Array.isArray(response.data)) {
            accountsData = response.data;
          } else {
            console.error("Unexpected response format:", response);
            accountsData = [];
          }
    
          setGroups(accountsData);
        } catch (err: any) {
          console.error("❌ Failed to load groups:", err);
    
          // 401 = Unauthorized - brak dostępu
          if (err.status === 401) {
            setError("Access denied. You don't have permission to view groups.");
          } 
          // Inne błędy
          else {
            setError(err.message || "Failed to load groups");
          }
        } finally {
          setIsLoading(false);
        }
  }

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
    if (!formData.groupId){
      setError("Group is required");
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

      const response = await api.post("/preschoolers", {
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
              {group.groupName}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="parentId" className={styles.label}>
          Parent *
        </label>
        <select
          id="parentId"
          name="parentId"
          value={formData.parentId}
          onChange={handleSelectChange}
          required
          disabled={isLoading}
          className={styles.input}
          >
            <option value="">Select a Parent</option>
            {parents.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {" (" + parent.firstName + " " + parent.lastName + ")"}
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