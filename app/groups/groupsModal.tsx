import React, { useEffect, useState } from 'react';
import { api } from '~/utils/serviceAPI';
import styles from "./NewGroupModal.module.css";
import { X, Users, User } from "lucide-react";

interface NewGroupModalProps {
  show: boolean;
  onHide: () => void;
  occupiedIds: number[];
}

interface GroupState {
  groupName: string;
  mainCaretakerId: number | string;
}

interface Teacher {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export default function NewGroupModal({ show, onHide, occupiedIds }: NewGroupModalProps) {
  const [groupState, setGroupState] = useState<GroupState>({
    groupName: '',
    mainCaretakerId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    if (show) {
      // Reset stanu przy otwarciu
      setGroupState({ groupName: '', mainCaretakerId: '' });
      setSubmitError(null);
      fetchTeachers();
    }
  }, [show]);

  const fetchTeachers = async () => {
    try {
      const response = await api.get<Teacher[]>("/accounts/teachers");
      // Upewniamy się, że to tablica
      const data = Array.isArray(response) ? response : (response as any).data || [];
      setTeachers(data);
    } catch (err) {
      console.error("❌ Failed to fetch teachers:", err);
      setSubmitError("Failed to load teachers list.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!groupState.groupName.trim()) {
        setSubmitError("Group name is required.");
        return;
    }
    if (!groupState.mainCaretakerId) {
        setSubmitError("Please select a main caretaker.");
        return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/groups", {
        groupName: groupState.groupName,
        mainCaretakerId: Number(groupState.mainCaretakerId)
      });
      onHide();
    } catch (error: any) {
      console.error(error);
      setSubmitError(error.message || "Failed to create group.");
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
          <h2 className={styles.modalTitle}>Create New Group</h2>
          <button onClick={onHide} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {submitError && (
            <div className={styles.errorMessage}>
                {submitError}
            </div>
        )}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          
          {/* GROUP NAME */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
                <Users size={16} style={{marginRight: '6px'}}/> Group Name
            </label>
            <input 
              type="text" 
              className={styles.formInput}
              placeholder="e.g. Tigers, Sunflowers..." 
              required 
              value={groupState.groupName}
              onChange={(e) => setGroupState({...groupState, groupName: e.target.value})}
            />
          </div>

          {/* CARETAKER SELECT */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
                <User size={16} style={{marginRight: '6px'}}/> Main Caretaker
            </label>
            <div className={styles.selectWrapper}>
                <select 
                className={styles.formSelect}
                value={groupState.mainCaretakerId}
                onChange={(e) => setGroupState({...groupState, mainCaretakerId: e.target.value})}
                required
                >
                <option value="">-- Select Teacher --</option>
                {teachers.map((teacher) => {
                    const isOccupied = occupiedIds.includes(teacher.id);
                    return (
                    <option 
                        key={teacher.id} 
                        value={teacher.id} 
                        disabled={isOccupied}
                        className={isOccupied ? styles.optionDisabled : ''}
                    >
                        {teacher.firstName} {teacher.lastName} 
                        {isOccupied ? " (Already assigned)" : ""}
                    </option>
                    );
                })}
                </select>
            </div>
            <small style={{color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px'}}>
                Only teachers not currently assigned to other groups can be selected.
            </small>
          </div>
          
          {/* ACTIONS */}
          <div className={styles.modalActions}>
            <button type="button" onClick={onHide} className={styles.cancelButton} disabled={isSubmitting}>
                Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}