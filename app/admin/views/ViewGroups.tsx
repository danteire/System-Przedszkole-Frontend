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

interface Teacher {
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

export default function ViewGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [preschoolers, setPreschoolers] = useState<Preschooler[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(()=>{
      loadGroups();
      loadTeachers();
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
    const loadTeachers = async () => {
        setIsLoading(true);
        setError(null);
        try {
              if (!api.isAuthenticated()) {
                throw new Error("You are not authenticated. Please log in again.");
              }
        
              console.log("📤 Fetching teachers...");
        
              const response = await api.get<Teacher[] | { data: Teacher[] }>("/accounts/teachers");
        
              console.log("✅ Parents fetched:", response);
        
              let accountsData: Teacher[];
              if (Array.isArray(response)) {
                accountsData = response;
              } else if (response && 'data' in response && Array.isArray(response.data)) {
                accountsData = response.data;
              } else {
                console.error("Unexpected response format:", response);
                accountsData = [];
              }
        
              setTeachers(accountsData);
            } catch (err: any) {
              console.error("❌ Failed to load teachers:", err);
        
              // 401 = Unauthorized - brak dostępu
              if (err.status === 401) {
                setError("Access denied. You don't have permission to view teachers.");
              } 
              // Inne błędy
              else {
                setError(err.message || "Failed to load teachers");
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
      
            let groupsData: Group[];
            if (Array.isArray(response)) {
              groupsData = response;
            } else if (response && 'data' in response && Array.isArray(response.data)) {
              groupsData = response.data;
            } else {
              console.error("Unexpected response format:", response);
              groupsData = [];
            }
      
            setGroups(groupsData);
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
      await api.delete(`/groups/${id}`);
      console.log(`✅ group ${id} deleted`);

      setGroups(groups.filter(a => a.id !== id));

      alert("group deleted successfully!");
    } catch (err: any) {
      console.error("❌ Failed to delete group:", err);

      // 401 = Unauthorized - brak dostępu
      if (err.status === 401) {
        alert("Access denied. You don't have permission to delete group.");
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
        <button onClick={loadGroups} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  if (preschoolers.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No accounts found</p>
        <button onClick={loadGroups} className={styles.refreshButton}>
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
        <button onClick={loadGroups} className={styles.refreshButton}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Group Name</th>
              <th>Main Caretaker Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id}>
                <td>{group.id}</td>
                <td>{group.groupName}</td>
                <td>{group.mainCaretakerId}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => alert(`Edit group ${group.id} - Not implemented yet`)}
                      title="Edit group"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className={styles.actionBtnDanger}
                      onClick={() => handleDelete(group.id, group.groupName)}
                      title="Delete group"
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