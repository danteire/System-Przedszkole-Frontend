// app/routes/adminPanel/views/ViewTeachers.tsx
import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { Trash2, Edit, RefreshCw } from "lucide-react";
import styles from "./View.module.css";

interface Account {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  accountType: string;
}

export default function ViewAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!api.isAuthenticated()) {
        throw new Error("You are not authenticated. Please log in again.");
      }

      console.log("📤 Fetching accounts...");

      const response = await api.get<Account[] | { data: Account[] }>("/accounts");

      console.log("✅ Accounts fetched:", response);

      let accountsData: Account[];
      if (Array.isArray(response)) {
        accountsData = response;
      } else if (response && 'data' in response && Array.isArray(response.data)) {
        accountsData = response.data;
      } else {
        console.error("Unexpected response format:", response);
        accountsData = [];
      }

      setAccounts(accountsData);
    } catch (err: any) {
      console.error("❌ Failed to load accounts:", err);

      // 401 = Unauthorized - brak dostępu
      if (err.status === 401) {
        setError("Access denied. You don't have permission to view accounts.");
      } 
      // Inne błędy
      else {
        setError(err.message || "Failed to load accounts");
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
      await api.delete(`/teachers/${id}`);
      console.log(`✅ Account ${id} deleted`);

      setAccounts(accounts.filter(a => a.id !== id));

      alert("Account deleted successfully!");
    } catch (err: any) {
      console.error("❌ Failed to delete account:", err);

      // 401 = Unauthorized - brak dostępu
      if (err.status === 401) {
        alert("Access denied. You don't have permission to delete accounts.");
      } 
      // Inne błędy
      else {
        alert(err.message || "Failed to delete account");
      }
    }
  };

  const getBadgeClass = (accountType: string) => {
    switch (accountType) {
      case "ADMIN":
        return styles.badgeAdmin;
      case "TEACHER":
        return styles.badgeTeacher;
      case "PARENT":
        return styles.badgeParent;
      default:
        return styles.badge;
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <RefreshCw className={styles.spinner} size={32} />
        <p>Loading accounts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.error}>{error}</div>
        <button onClick={loadTeachers} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No accounts found</p>
        <button onClick={loadTeachers} className={styles.refreshButton}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
    );
  }

  const stats = {
    admin: accounts.filter(a => a.accountType === "ADMIN").length,
    teacher: accounts.filter(a => a.accountType === "TEACHER").length,
    parent: accounts.filter(a => a.accountType === "PARENT").length,
  };

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeader}>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total:</span>
            <span className={styles.statValue}>{accounts.length}</span>
          </div>
          <div className={styles.statItem}>
            <span className={`${styles.statLabel} ${styles.adminColor}`}>Admins:</span>
            <span className={styles.statValue}>{stats.admin}</span>
          </div>
          <div className={styles.statItem}>
            <span className={`${styles.statLabel} ${styles.teacherColor}`}>Teachers:</span>
            <span className={styles.statValue}>{stats.teacher}</span>
          </div>
          <div className={styles.statItem}>
            <span className={`${styles.statLabel} ${styles.parentColor}`}>Parents:</span>
            <span className={styles.statValue}>{stats.parent}</span>
          </div>
        </div>
        <button onClick={loadTeachers} className={styles.refreshButton}>
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
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>{account.id}</td>
                <td>{account.firstName}</td>
                <td>{account.lastName}</td>
                <td>{account.email}</td>
                <td>
                  <span className={`${styles.badge} ${getBadgeClass(account.accountType)}`}>
                    {account.accountType}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => alert(`Edit account ${account.id} - Not implemented yet`)}
                      title="Edit account"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className={styles.actionBtnDanger}
                      onClick={() => handleDelete(account.id, `${account.firstName} ${account.lastName}`)}
                      title="Delete account"
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