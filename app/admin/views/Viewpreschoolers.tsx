// app/routes/adminPanel/views/ViewTeachers.tsx
import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { Trash2, Edit, RefreshCw } from "lucide-react";
import styles from "./View.module.css";

interface Preschooler {
  id: number;  
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

export default function ViewAccounts() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [preschoolers, setPreschoolers] = useState<Preschooler[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mapParentEmail, setMapParentEmail] = useState<Map<number, string>>(new Map());

  useEffect(()=>{
      loadParents();
      loadGroups();
      loadPreschoolers();
    }, []);
    
    const loadPreschoolers = async () =>{
        setIsLoading(true);
        setError(null);
      try {
            if (!api.isAuthenticated()) {
              throw new Error("You are not authenticated. Please log in again.");
            }
      
            console.log("📤 Fetching Preschoolers...");
      
            const response = await api.get<Preschooler[] | { data: Preschooler[] }>("/preschoolers");
      
            console.log("✅ Preschooler fetched:", response);
      
            let data: Preschooler[];
            if (Array.isArray(response)) {
              data = response;
            } else if (response && 'data' in response && Array.isArray(response.data)) {
              data = response.data;
            } else {
              console.error("Unexpected response format:", response);
              data = [];
            }
      
            setPreschoolers(data);
          } catch (err: any) {
            console.error("❌ Failed to load Preschooler:", err);
      
            // 401 = Unauthorized - brak dostępu
            if (err.status === 401) {
              setError("Access denied. You don't have permission to view Preschooler.");
            } 
            // Inne błędy
            else {
              setError(err.message || "Failed to load Preschooler");
            }
          } finally {
            setIsLoading(false);
          }
    }
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
            setMapParentEmail(new Map(accountsData.map(parent => [parent.id, parent.email])));
            console.log("✅ mapParentEmail set:", mapParentEmail);
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

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      await api.delete(`/preschoolers/${id}`);
      console.log(`✅ Preschooler ${id} deleted`);

      setPreschoolers(preschoolers.filter(a => a.id !== id));

      alert("Preschooler deleted successfully!");
    } catch (err: any) {
      console.error("❌ Failed to delete Preschooler:", err);

      // 401 = Unauthorized - brak dostępu
      if (err.status === 401) {
        alert("Access denied. You don't have permission to delete Preschoolers.");
      } 
      // Inne błędy
      else {
        alert(err.message || "Failed to delete account");
      }
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <RefreshCw className={styles.spinner} size={32} />
        <p>Loading Preschoolers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.error}>{error}</div>
        <button onClick={loadPreschoolers} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  if (preschoolers.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No accounts found</p>
        <button onClick={loadPreschoolers} className={styles.refreshButton}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeader}>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total:</span>
            <span className={styles.statValue}>{preschoolers.length}</span>
          </div>
        </div>
        <button onClick={loadPreschoolers} className={styles.refreshButton}>
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
              <th>Group ID</th>
              <th>Parent Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {preschoolers.map((account) => (
              <tr key={account.id}>
                <td>{account.id}</td>
                <td>{account.firstName}</td>
                <td>{account.lastName}</td>
                <td>{account.groupId}</td>
                <td>
                  {account.parentId && mapParentEmail.has(account.parentId)
                    ? mapParentEmail.get(account.parentId)
                    : "No email/parent"}
                </td>              
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => alert(`Edit account ${account.id} - Not implemented yet`)}
                      title="Edit Preschooler"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className={styles.actionBtnDanger}
                      onClick={() => handleDelete(account.id, `${account.firstName} ${account.lastName}`)}
                      title="Delete Preschooler"
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