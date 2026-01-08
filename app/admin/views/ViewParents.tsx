// app/routes/adminPanel/views/ViewParents.tsx
import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { Trash2, Edit, RefreshCw } from "lucide-react";
import styles from "./View.module.css";

interface Parent {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  accountType: string;
}

export default function ViewParents() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = async () => {
    setLoading(true);
    setError(null);

    try {
      // Sprawdź czy zalogowany
      if (!api.isAuthenticated()) {
        throw new Error("You are not authenticated. Please log in again.");
      }

      console.log("📤 Fetching Parents...");

      // Backend może zwracać:
      // 1. Bezpośrednio tablicę: Parent[]
      // 2. Obiekt z data: { data: Parent[] }
      const response = await api.get<Parent[] | { data: Parent[] }>("/accounts/parents");

      console.log("✅ Parents fetched:", response);

      // Sprawdź format odpowiedzi
      let ParentsData: Parent[];
      if (Array.isArray(response)) {
        ParentsData = response;
      } else if (response && 'data' in response && Array.isArray(response.data)) {
        ParentsData = response.data;
      } else {
        console.error("Unexpected response format:", response);
        ParentsData = [];
      }

      setParents(ParentsData);
    } catch (err: any) {
      console.error("❌ Failed to load Parents:", err);

      if (err.status === 403) {
        setError("Session expired or insufficient permissions. Please log in again.");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        setError(err.message || "Failed to load Parents");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      await api.delete(`/parents/${id}`);
      console.log(`✅ Parent ${id} deleted`);

      // Usuń z lokalnej listy
      setParents(parents.filter(t => t.id !== id));

      alert("Parent deleted successfully!");
    } catch (err: any) {
      console.error("❌ Failed to delete Parent:", err);
      alert(err.message || "Failed to delete Parent");
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <RefreshCw className={styles.spinner} size={32} />
        <p>Loading Parents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.error}>{error}</div>
        <button onClick={loadParents} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  if (parents.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No Parents found</p>
        <button onClick={loadParents} className={styles.refreshButton}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeader}>
        <p className={styles.count}>
          Total Parents: <strong>{parents.length}</strong>
        </p>
        <button onClick={loadParents} className={styles.refreshButton}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Account Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {parents.map((Parent) => (
              <tr key={Parent.id}>
                <td>{Parent.id}</td>
                <td>{Parent.firstName}</td>
                <td>{Parent.lastName}</td>
                <td>{Parent.email}</td>
                <td>
                  <span className={styles.badge}>{Parent.accountType}</span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => alert(`Edit Parent ${Parent.id} - Not implemented yet`)}
                      title="Edit Parent"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className={styles.actionBtnDanger}
                      onClick={() => handleDelete(Parent.id, `${Parent.firstName} ${Parent.lastName}`)}
                      title="Delete Parent"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}