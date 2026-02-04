import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { Trash2, Edit, RefreshCw, Save } from "lucide-react";
import styles from "./View.module.css";

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

interface EditGroupData {
  groupName: string;
  mainCaretakerId: number | "";
}

export default function ViewGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- State for Editing ---
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editForm, setEditForm] = useState<EditGroupData>({ groupName: "", mainCaretakerId: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
      loadGroups();
      loadTeachers();
  }, []);
    
  const loadTeachers = async () => {
        try {
            const response = await api.get<Teacher[] | { data: Teacher[] }>("/accounts/teachers");
            let data: Teacher[];
            if (Array.isArray(response)) {
                data = response;
            } else if (response && 'data' in response && Array.isArray(response.data)) {
                data = response.data;
            } else {
                data = [];
            }
            setTeachers(data);
        } catch (err: any) {
            console.error("❌ Failed to load teachers:", err);
        }
  }
  
  const loadGroups = async () => {
      setIsLoading(true);
      setError(null);
      try {
            if (!api.isAuthenticated()) {
              throw new Error("You are not authenticated. Please log in again.");
            }
            const response = await api.get<Group[] | { data: Group[] }>("/groups");
            let groupsData: Group[];
            if (Array.isArray(response)) {
              groupsData = response;
            } else if (response && 'data' in response && Array.isArray(response.data)) {
              groupsData = response.data;
            } else {
              groupsData = [];
            }
            setGroups(groupsData);
      } catch (err: any) {
            console.error("❌ Failed to load groups:", err);
            setError(err.message || "Failed to load groups");
      } finally {
            setIsLoading(false);
      }
  }

  // --- EDIT LOGIC ---

  const handleEditClick = (group: Group) => {
    setEditingGroup(group);
    setEditForm({
      groupName: group.groupName,
      mainCaretakerId: group.mainCaretakerId || ""
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;

    setIsUpdating(true);
    try {
      const payload = {
          groupName: editForm.groupName,
          mainCaretakerId: Number(editForm.mainCaretakerId) || null,
      };

      console.log("Updating group with payload:", payload);
      const updatedGroup = await api.put<Group>(`/groups/${editingGroup.id}`, payload);
      
      setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
      
      setEditingGroup(null); 
    } catch (err: any) {
      console.error("Update failed", err);
      setError(err.message || "Failed to update group");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete group: ${name}?`)) {
      return;
    }
    try {
      await api.delete(`/groups/${id}`);
      setGroups(groups.filter(a => a.id !== id));
    } catch (err: any) {
      console.error("❌ Failed to delete group:", err);
      setError(err.message || "Failed to delete group");
    }
  };

  const getTeacherName = (id: number) => {
      const t = teachers.find(teacher => teacher.id === id);
      return t ? `${t.firstName} ${t.lastName}` : "Unknown / Admin";
  };

  // --- LOGIKA FILTROWANIA NAUCZYCIELI ---
  // Tworzymy listę nauczycieli dostępnych do wyboru w formularzu
  const getAvailableTeachersForEdit = () => {
      if (!editingGroup) return [];

      return teachers.filter(teacher => {
          // 1. Sprawdź, czy nauczyciel jest przypisany do jakiejkolwiek grupy
          const assignedGroup = groups.find(g => g.mainCaretakerId === teacher.id);

          // 2. Jeśli nie jest przypisany nigdzie -> DOSTĘPNY
          if (!assignedGroup) return true;

          // 3. Jeśli jest przypisany, ale do TEJ SAMEJ grupy którą właśnie edytujemy -> DOSTĘPNY
          // (żeby nie zniknął z listy wyboru obecny wychowawca)
          if (assignedGroup.id === editingGroup.id) return true;

          // 4. W przeciwnym razie -> NIEDOSTĘPNY (zajęty przez inną grupę)
          return false;
      });
  };

  if (isLoading) return <div className={styles.loading}><RefreshCw className={styles.spinner} size={32} /><p>Loading Groups...</p></div>;
  if (error) return <div className={styles.errorContainer}><div className={styles.error}>{error}</div><button onClick={loadGroups} className={styles.retryButton}>Try Again</button></div>;

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeader}>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Groups:</span>
            <span className={styles.statValue}>{groups.length}</span>
          </div>
        </div>
        <button onClick={loadGroups} className={styles.refreshButton}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Group Name</th>
              <th>Main Caretaker</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id}>
                <td>{group.id}</td>
                <td>{group.groupName}</td>
                <td>{getTeacherName(group.mainCaretakerId)}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleEditClick(group)}
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

      {/* --- EDIT MODAL --- */}
      {editingGroup && (
        <div className={styles.modalOverlay} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className={styles.modalCard} style={{
              background: 'white', padding: '2rem', borderRadius: '8px', width: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748'}}>Edit Group</h2>
            
            <form onSubmit={handleUpdate}>
                <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568'}}>Group Name</label>
                    <input 
                        name="groupName" 
                        value={editForm.groupName} 
                        onChange={handleEditChange} 
                        className={styles.input}
                        style={{width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px'}}
                        required 
                    />
                </div>
                
                <div style={{marginBottom: '1.5rem'}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568'}}>Main Caretaker</label>
                    <select 
                        name="mainCaretakerId" 
                        value={editForm.mainCaretakerId} 
                        onChange={handleEditChange} 
                        className={styles.select}
                        style={{width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px'}}

                    >
                        <option value="">-- Select Teacher --</option>
                        {getAvailableTeachersForEdit().map(t => (
                            <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                        ))}
                    </select>
                    <small style={{display: 'block', marginTop: '5px', color: '#718096', fontSize: '0.8rem'}}>
                        * Only teachers not assigned to other groups are shown.
                    </small>
                </div>

                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                    <button 
                        type="button" 
                        onClick={() => setEditingGroup(null)}
                        style={{background: 'transparent', border: 'none', color: '#718096', cursor: 'pointer', fontWeight: 600}}
                        disabled={isUpdating}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        style={{
                            background: '#3182ce', color: 'white', border: 'none', padding: '0.5rem 1rem', 
                            borderRadius: '4px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px'
                        }}
                        disabled={isUpdating}
                    >
                        {isUpdating ? <RefreshCw className="animate-spin" size={16}/> : <Save size={16}/>}
                        Save Changes
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}