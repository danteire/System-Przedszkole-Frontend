import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { Trash2, Edit, RefreshCw, X, Save } from "lucide-react";
import styles from "./View.module.css";

interface Account {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  accountType: string;
}

interface EditAccountData {
  firstName: string;
  lastName: string;
  email: string;
  accountType: string;
}

export default function ViewAccounts() {

  const isAdmin = api.isAdmin();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- State for Editing ---
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editForm, setEditForm] = useState<EditAccountData>({ firstName: "", lastName: "", email: "", accountType: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!api.isAuthenticated()) {
        throw new Error("You are not authenticated. Please log in again.");
      }

      console.log("📤 Fetching accounts...");
      const response = await api.get<Account[] | { data: Account[] }>("/accounts");
      
      let accountsData: Account[];
      if (Array.isArray(response)) {
        accountsData = response;
      } else if (response && 'data' in response && Array.isArray(response.data)) {
        accountsData = response.data;
      } else {
        accountsData = [];
      }

      setAccounts(accountsData);
    } catch (err: any) {
      console.error("❌ Failed to load accounts:", err);
      if (err.status === 401) {
        setError("Access denied.");
      } else {
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
    const delAcc = accounts.find((acc) => acc.id === id);
    if((delAcc?.accountType === "ADMIN" || delAcc?.accountType === "TEACHER") && !isAdmin){
      setError("Access denied. Cannot delete this account");
      return;
    } 
    try {
      await api.delete(`/accounts/${id}`);
      setAccounts(accounts.filter(a => a.id !== id));
      alert("Account deleted successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to delete account");
    }
  };

  // --- Edit Logic ---

  const handleEditClick = (account: Account) => {
    setEditingAccount(account);
    setEditForm({
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      accountType: account.accountType
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    setIsUpdating(true);
    try {
      // PUT /accounts/{id} 
      const updatedAccount = await api.put<Account>(`/accounts/${editingAccount.id}`, editForm);
      
      // Update local state
      setAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
      
      setEditingAccount(null); // Close modal
      alert("Account updated successfully!");
    } catch (err: any) {
      console.error("Update failed", err);
      alert(err.message || "Failed to update account");
    } finally {
      setIsUpdating(false);
    }
  };

  const getBadgeClass = (accountType: string) => {
    switch (accountType) {
      case "ADMIN": return styles.badgeAdmin;
      case "TEACHER": return styles.badgeTeacher;
      case "PARENT": return styles.badgeParent;
      default: return styles.badge;
    }
  };

  if (loading) return <div className={styles.loading}><RefreshCw className={styles.spinner} size={32} /><p>Loading accounts...</p></div>;
  if (error) return <div className={styles.errorContainer}><div className={styles.error}>{error}</div><button onClick={loadAccounts} className={styles.retryButton}>Try Again</button></div>;

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeader}>
        {/* ...Stats (bez zmian)... */}
        <div className={styles.stats}>
           <div className={styles.statItem}><span className={styles.statLabel}>Total:</span> <span className={styles.statValue}>{accounts.length}</span></div>
        </div>
        <button onClick={loadAccounts} className={styles.refreshButton}>
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
                      onClick={() => handleEditClick(account)} // Tu podpięcie edycji
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

      {/* --- EDIT MODAL --- */}
      {editingAccount && (
        <div className={styles.modalOverlay} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className={styles.modalCard} style={{
              background: 'white', padding: '2rem', borderRadius: '8px', width: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748'}}>Edit Account</h2>
            
            <form onSubmit={handleUpdate}>
                <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568'}}>First Name</label>
                    <input 
                        name="firstName" 
                        value={editForm.firstName} 
                        onChange={handleEditChange} 
                        className={styles.input} // Używam klasy z twojego CSS jeśli jest, lub dodaj styl
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
                <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568'}}>Email</label>
                    <input 
                        name="email" 
                        type="email"
                        value={editForm.email} 
                        onChange={handleEditChange} 
                        className={styles.input}
                        style={{width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px'}}
                        required 
                    />
                </div>
                <div style={{marginBottom: '1.5rem'}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4a5568'}}>Password</label>
                    <input 
                        name="password" 
                        type="password"
                        placeholder="Enter new password to change"
                        onChange={handleEditChange} 
                        className={styles.input}
                        style={{width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px'}}
        
                    />
                </div>

                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                    <button 
                        type="button" 
                        onClick={() => setEditingAccount(null)}
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