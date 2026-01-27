import React, { useState, useEffect } from 'react';
import { api } from '~/utils/serviceAPI';
import styles from "./NewGroupModal.module.css"; // Używamy stylów modala formularzowego
import { X, User, Baby, Fingerprint } from "lucide-react";

interface Props {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  groupId: number;
  groupName: string;
}

interface Parent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function AddPreschoolerModal({ show, onHide, onSuccess, groupId, groupName }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pesel, setPesel] = useState("");
  const [parentId, setParentId] = useState("");
  
  const [parents, setParents] = useState<Parent[]>([]);
  const [loadingParents, setLoadingParents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      // Reset form
      setFirstName("");
      setLastName("");
      setParentId("");
      setError(null);
      fetchParents();
    }
  }, [show]);

  const fetchParents = async () => {
    setLoadingParents(true);
    try {
      // Zakładam, że istnieje endpoint zwracający rodziców (analogicznie do teachers)
      const response = await api.get<Parent[]>("/accounts/parents"); 
      const data = Array.isArray(response) ? response : (response as any).data || [];
      setParents(data);
    } catch (err) {
      console.error("Failed to load parents", err);
      // Nie blokujemy formularza, może backend pozwala dodać bez rodzica? 
      // Ale zazwyczaj rodzic jest wymagany.
    } finally {
      setLoadingParents(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        firstName,
        lastName,
        groupId: groupId,
        parentId: parentId ? Number(parentId) : null
      };

      await api.post("/preschoolers", payload);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError("Failed to add preschooler. Please check the data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onHide}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Add Student</h2>
            <p style={{fontSize: '0.9rem', color: '#718096', margin: 0}}>To group: <strong>{groupName}</strong></p>
          </div>
          <button onClick={onHide} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* FIRST NAME */}
              <div className={styles.formGroup}>
                <label className={styles.label}>First Name</label>
                <input 
                  type="text" 
                  className={styles.formInput}
                  required 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. John"
                />
              </div>

              {/* LAST NAME */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Last Name</label>
                <input 
                  type="text" 
                  className={styles.formInput}
                  required 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Doe"
                />
              </div>
          </div>
          {/* PARENT SELECT */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
                <User size={16} style={{marginRight: '6px'}}/> Assign Parent
            </label>
            <div className={styles.selectWrapper}>
                <select 
                  className={styles.formSelect}
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  required
                  disabled={loadingParents}
                >
                  <option value="">-- Select Parent --</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.email})
                    </option>
                  ))}
                </select>
            </div>
            {loadingParents && <small style={{color: '#718096'}}>Loading parents list...</small>}
          </div>

          {/* ACTIONS */}
          <div className={styles.modalActions}>
            <button type="button" onClick={onHide} className={styles.cancelButton} disabled={isSubmitting}>
                Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}