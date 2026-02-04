import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { Trash2, Edit, RefreshCw, Save } from "lucide-react";
import styles from "./View.module.css";

interface Preschooler {
  id: number;  
  firstName: string;
  lastName: string;
  parentId?: number;
  groupId?: number;
}

interface Parent {
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

// Typ formularza edycji
interface EditPreschoolerData {
  firstName: string;
  lastName: string;
  parentId: number | "";
  groupId: number | "";
}

export default function ViewPreschoolers() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [preschoolers, setPreschoolers] = useState<Preschooler[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapParentEmail, setMapParentEmail] = useState<Map<number, string>>(new Map());

  // --- STATE FOR EDITING ---
  const [editingPreschooler, setEditingPreschooler] = useState<Preschooler | null>(null);
  const [editForm, setEditForm] = useState<EditPreschoolerData>({ 
      firstName: "", 
      lastName: "", 
      parentId: "", 
      groupId: "" 
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(()=>{
      loadParents();
      loadGroups();
      loadPreschoolers();
  }, []);
    
  const loadPreschoolers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (!api.isAuthenticated()) {
              throw new Error("You are not authenticated. Please log in again.");
            }
            console.log("📤 Fetching Preschoolers...");
            const response = await api.get<Preschooler[] | { data: Preschooler[] }>("/preschoolers");
            
            let data: Preschooler[];
            if (Array.isArray(response)) {
              data = response;
            } else if (response && 'data' in response && Array.isArray(response.data)) {
              data = response.data;
            } else {
              data = [];
            }
            setPreschoolers(data);
        } catch (err: any) {
            console.error("❌ Failed to load Preschooler:", err);
            setError(err.message || "Failed to load Preschooler");
        } finally {
            setIsLoading(false);
        }
  }

  const loadParents = async () => {
      try {
            const response = await api.get<Parent[]>("/accounts/parents"); // Zakładam, że endpoint zwraca tablicę
            const data = Array.isArray(response) ? response : [];
            setParents(data);
            setMapParentEmail(new Map(data.map(parent => [parent.id, parent.email])));
      } catch (err: any) {
            console.error("❌ Failed to load Parents:", err);
      }
  }
  
  const loadGroups = async () => {
      try {
            const response = await api.get<Group[]>("/groups");
            const data = Array.isArray(response) ? response : [];
            setGroups(data);
      } catch (err: any) {
            console.error("❌ Failed to load groups:", err);
      }
  }

  // --- EDIT HANDLERS ---

  const handleEditClick = (preschooler: Preschooler) => {
    setEditingPreschooler(preschooler);
    setEditForm({
      firstName: preschooler.firstName,
      lastName: preschooler.lastName,
      parentId: preschooler.parentId || "",
      groupId: preschooler.groupId || ""
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
    
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPreschooler) return;

    setIsUpdating(true);
    try {
      // PUT /preschoolers/{id} 
      // Uwaga: Upewnij się, że backend obsługuje taki endpoint i body
      const payload = {
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          // Jeśli puste stringi, wyślij null (zależy od backendu)
          parentId: editForm.parentId ? Number(editForm.parentId) : null,
          groupId: editForm.groupId ? Number(editForm.groupId) : null
      };

      const updatedPreschooler = await api.put<Preschooler>(`/preschoolers/${editingPreschooler.id}`, payload);
      
      // Update local state
      setPreschoolers(prev => prev.map(p => p.id === updatedPreschooler.id ? updatedPreschooler : p));
      
      setEditingPreschooler(null); 
    } catch (err: any) {
      console.error("Update failed", err);
      setError(err.message || "Failed to update preschooler");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }
    try {
      await api.delete(`/preschoolers/${id}`);
      setPreschoolers(preschoolers.filter(a => a.id !== id));
    } catch (err: any) {
      console.error("❌ Failed to delete:", err);
      setError(err.message || "Failed to delete");
    }
  };

  if (isLoading) return <div className={styles.loading}><RefreshCw className={styles.spinner} size={32} /><p>Loading Preschoolers...</p></div>;
  if (error) return <div className={styles.errorContainer}><div className={styles.error}>{error}</div><button onClick={loadPreschoolers} className={styles.retryButton}>Try Again</button></div>;

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
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Group Name</th>
              <th>Parent Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {preschoolers.map((child) => (
              <tr key={child.id}>
                <td>{child.id}</td>
                <td>{child.firstName}</td>
                <td>{child.lastName}</td>
                <td>{groups.find(g => g.id === child.groupId)?.groupName || "No group"}</td>
                <td>
                  {child.parentId && mapParentEmail.has(child.parentId)
                    ? mapParentEmail.get(child.parentId)
                    : "No parent assigned"}
                </td>              
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleEditClick(child)}
                      title="Edit Preschooler"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className={styles.actionBtnDanger}
                      onClick={() => handleDelete(child.id, `${child.firstName} ${child.lastName}`)}
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

      {/* --- EDIT MODAL --- */}
      {editingPreschooler && (
        <div className={styles.modalOverlay} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className={styles.modalCard} style={{
              background: 'white', padding: '2rem', borderRadius: '8px', width: '450px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748'}}>Edit Preschooler</h2>
            
            <form onSubmit={handleUpdate}>
                <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568'}}>First Name</label>
                    <input 
                        name="firstName" 
                        value={editForm.firstName} 
                        onChange={handleEditChange} 
                        className={styles.input}
                        style={{width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px'}}
                        required 
                    />
                </div>
                <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568'}}>Last Name</label>
                    <input 
                        name="lastName" 
                        value={editForm.lastName} 
                        onChange={handleEditChange} 
                        className={styles.input}
                        style={{width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px'}}
                        required 
                    />
                </div>
                
                {/* Select Group */}
                <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568'}}>Group</label>
                    <select 
                        name="groupId" 
                        value={editForm.groupId} 
                        onChange={handleEditChange} 
                        className={styles.select}
                        style={{width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px'}}
                    >
                        <option value="">-- No Group --</option>
                        {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.groupName}</option>
                        ))}
                    </select>
                </div>

                {/* Select Parent */}
                <div style={{marginBottom: '1.5rem'}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568'}}>Parent</label>
                    <select 
                        name="parentId" 
                        value={editForm.parentId} 
                        onChange={handleEditChange} 
                        className={styles.select}
                        style={{width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px'}}
                    >
                        <option value="">-- No Parent --</option>
                        {parents.map(p => (
                            <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.email})</option>
                        ))}
                    </select>
                </div>

                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                    <button 
                        type="button" 
                        onClick={() => setEditingPreschooler(null)}
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