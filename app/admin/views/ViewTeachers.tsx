// app/routes/adminPanel/views/ViewTeachers.tsx
import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import styles from "./View.module.css";

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function ViewTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const data = await api.get<{ data: Teacher[] }>("/accounts");
      setTeachers(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading teachers...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (teachers.length === 0) {
    return <div className={styles.empty}>No teachers found</div>;
  }

  return (
    <div className={styles.viewContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <tr key={teacher.id}>
              <td>{teacher.id}</td>
              <td>{teacher.firstName} {teacher.lastName}</td>
              <td>{teacher.email}</td>
              <td>
                <button className={styles.actionBtn}>Edit</button>
                <button className={styles.actionBtnDanger}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}