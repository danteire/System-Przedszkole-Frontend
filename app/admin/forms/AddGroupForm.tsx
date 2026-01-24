import { useEffect, useState } from "react";
import { api } from "~/utils/serviceAPI";
import styles from "./Form.module.css";

interface AddGroupFormProps {
  onSuccess: () => void;
}

interface GroupFormData {
  groupName: string;
  mainCaretakerId?: number;
}

interface Teacher {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  accountType: string;
}

interface Group {
  id: number;
  groupName: string;
  mainCaretakerId: number;
}

export default function AddGroupForm({ onSuccess }: AddGroupFormProps) {
  const [formData, setFormData] = useState<GroupFormData>({
    groupName: '',
    mainCaretakerId: undefined,
  });

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadTeachers();
    loadGroups();
  }, []);

  const loadTeachers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!api.isAuthenticated()) {
        throw new Error("You are not authenticated.");
      }
      const response = await api.get<Teacher[] | { data: Teacher[] }>("/accounts/teachers");
      let accountsData: Teacher[];
      if (Array.isArray(response)) {
        accountsData = response;
      } else if (response && 'data' in response && Array.isArray(response.data)) {
        accountsData = response.data;
      } else {
        accountsData = [];
      }
      setTeachers(accountsData);
    } catch (err: any) {
      console.error("❌ Failed to load teachers:", err);
      // Ignorujemy błędy pobierania w UI, ewentualnie logujemy
    } finally {
      setIsLoading(false);
    }
  }

  const loadGroups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!api.isAuthenticated()) {
        throw new Error("You are not authenticated.");
      }
      const response = await api.get<Group[] | { data: Group[] }>("/groups");
      let accountsData: Group[];
      if (Array.isArray(response)) {
        accountsData = response;
      } else if (response && 'data' in response && Array.isArray(response.data)) {
        accountsData = response.data;
      } else {
        accountsData = [];
      }
      setGroups(accountsData);
    } catch (err: any) {
      console.error("❌ Failed to load groups:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // --- LOGIKA FILTROWANIA NAUCZYCIELI ---
  // Zwraca tylko nauczycieli, którzy nie są mainCaretakerId w żadnej istniejącej grupie
  const getAvailableTeachers = () => {
      // 1. Zbierz ID zajętych nauczycieli
      const assignedTeacherIds = new Set(groups.map(g => g.mainCaretakerId));

      // 2. Zwróć tylko tych, których ID nie ma w zbiorze
      return teachers.filter(t => !assignedTeacherIds.has(t.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    // Walidacja
    if (!formData.groupName.trim()) {
      setError("Group name is required");
      setIsLoading(false);
      return;
    }

    try {
      // Sprawdź uprawnienia (Admin LUB Teacher)
      if (!api.isAuthenticated()) {
        throw new Error("You are not authenticated. Please log in again.");
      }

      // ZMIANA: Pozwalamy też Nauczycielowi
      if (!api.isAdmin() && !api.isTeacher()) {
        throw new Error("You don't have permissions to create groups.");
      }

      const response = await api.post("/groups", {
        groupName: formData.groupName.trim(),
        mainCaretakerId: formData.mainCaretakerId,
      });

      console.log("✅ Group created successfully:", response);

      setSuccess(true);

      // Wyczyść formularz
      setFormData({
        groupName: '',
        mainCaretakerId: undefined,
      });

      // Pokaż sukces i zamknij po 1.5 sekundy
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err: any) {
      console.error("❌ Failed to create Group:", err);

      if (err.status === 401 || err.status === 403) {
        setError("Session expired or insufficient permissions.");
      } else if (err.status === 400) {
        setError(err.data?.message || "Invalid data. Please check your input.");
      } else if (err.status === 409) {
        setError("Group with this name or Teacher already exists.");
      } else {
        setError(err.message || "Failed to add Group. Please try again.");
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

  const availableTeachers = getAvailableTeachers();

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && (
        <div className={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className={styles.success}>
          <strong>Success!</strong> Group has been added successfully.
        </div>
      )}

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="groupName" className={styles.label}>
            Group Name *
          </label>
          <input
            type="text"
            id="groupName"
            name="groupName"
            value={formData.groupName}
            onChange={handleChange}
            required
            disabled={isLoading}
            className={styles.input}
            placeholder="Enter a group name"
            />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="mainCaretakerId" className={styles.label}>
          Main Caretaker *
        </label>
        <select
          id="mainCaretakerId"
          name="mainCaretakerId"
          value={formData.mainCaretakerId ?? ""}
          onChange={handleSelectChange}
          required
          disabled={isLoading}
          className={styles.input}
        >
          <option value="">Select a main caretaker</option>
          {/* ZMIANA: Mapujemy tylko dostępnych nauczycieli */}
          {availableTeachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.firstName} {teacher.lastName} ({teacher.email})
            </option>
          ))}
        </select>
        {availableTeachers.length === 0 && !isLoading && (
            <small style={{color: '#e53e3e', marginTop: '5px', display: 'block'}}>
                All teachers are currently assigned to groups.
            </small>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={styles.submitButton}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner}></span>
            Adding Group...
          </>
        ) : (
          "Add Group"
        )}
      </button>
    </form>
  );
}