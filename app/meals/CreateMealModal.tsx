import React, { useEffect, useState } from "react";
import { MealType } from "./mealTypes";
import styles from "./MealsPage.module.css";
import { X, Upload, Coffee, Sun, Moon, Utensils } from "lucide-react";

interface CreateMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, type: MealType, info: string, file: File | null, assignDate: string) => Promise<void>;
}

export const CreateMealModal: React.FC<CreateMealModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<MealType>(MealType.BREAKFAST);
  const [info, setInfo] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [assignDate, setAssignDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setType(MealType.BREAKFAST);
      setInfo("");
      setFile(null);
      setAssignDate("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setSaving(true);
    try {
      await onSave(name, type, info, file, assignDate);
      onClose();
    } catch (error) {
      alert("Failed to create meal.");
    } finally {
      setSaving(false);
    }
  };

  const mealTypes = [
    { value: MealType.BREAKFAST, label: 'Breakfast', icon: <Sun size={18} /> },
    { value: MealType.LUNCH, label: 'Lunch', icon: <Utensils size={18} /> },
    { value: MealType.SNACK, label: 'Snack', icon: <Coffee size={18} /> },
    { value: MealType.DINNER, label: 'Dinner', icon: <Moon size={18} /> }
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add New Meal</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          
          {/* NAME */}
          <div className={styles.formGroup}>
            <label className={styles.detailLabel}>Meal Name</label>
            <input
              type="text"
              className={styles.formInput}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Porridge with fruits"
              required
            />
          </div>

          {/* TYPE SELECTOR */}
          <div className={styles.formGroup}>
            <label className={styles.detailLabel}>Meal Type</label>
            <div className={styles.typeGrid}>
              {mealTypes.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`${styles.typeOption} ${type === opt.value ? styles.active : ''}`}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* INFO */}
          <div className={styles.formGroup}>
            <label className={styles.detailLabel}>Additional Info</label>
            <textarea
              className={styles.formTextarea}
              value={info}
              onChange={e => setInfo(e.target.value)}
              placeholder="Allergens, calories, notes..."
            />
          </div>

          {/* DATE ASSIGNMENT */}
          <div className={styles.formGroup} style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
            <label className={styles.detailLabel}>Assign to date (optional)</label>
            <input
              type="date"
              className={styles.formInput}
              value={assignDate}
              onChange={e => setAssignDate(e.target.value)}
            />
          </div>

          {/* PHOTO UPLOAD */}
          <div className={styles.formGroup}>
            <label className={styles.detailLabel}>Photo</label>
            <div className={styles.uploadArea}>
              <Upload size={24} className={styles.uploadIcon} />
              <p>Click to select photo</p>
              <input
                type="file"
                accept="image/*"
                onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
              />
              {file && <span className={styles.fileName}>{file.name}</span>}
            </div>
          </div>

          {/* ACTIONS */}
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton} disabled={saving}>Cancel</button>
            <button type="submit" className={styles.submitButton} disabled={saving}>
              {saving ? "Saving..." : "Create Meal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};