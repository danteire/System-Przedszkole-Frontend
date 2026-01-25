// app/meals/CreateMealModal.tsx
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

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className={styles.title} style={{ color: 'var(--text-main)', fontSize: '1.5rem' }}>Add New Meal</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Meal Name</label>
            <input
              type="text"
              className={styles.searchInput}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Porridge with fruits"
              required
              style={{ width: '100%' }}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Meal Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { value: MealType.BREAKFAST, label: 'Breakfast', icon: <Sun size={18} /> },
                { value: MealType.LUNCH, label: 'Lunch', icon: <Utensils size={18} /> },
                { value: MealType.SNACK, label: 'Snack', icon: <Coffee size={18} /> },
                { value: MealType.DINNER, label: 'Dinner', icon: <Moon size={18} /> }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '10px', borderRadius: 'var(--radius-full)', border: '2px solid',
                    borderColor: type === opt.value ? 'var(--color-primary)' : '#EEE',
                    background: type === opt.value ? 'var(--color-primary)' : 'white',
                    color: type === opt.value ? 'white' : 'var(--text-muted)',
                    fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Additional Info</label>
            <textarea
              className={styles.searchInput}
              value={info}
              onChange={e => setInfo(e.target.value)}
              placeholder="Allergens, calories, notes..."
              style={{ width: '100%', minHeight: '80px', borderRadius: 'var(--radius-lg)' }}
            />
          </div>

          <div className={styles.formGroup} style={{ borderTop: '2px solid #EEE', paddingTop: '20px', marginTop: '20px' }}>
            <label className={styles.label}>Assign to date (optional)</label>
            <input
              type="date"
              className={styles.searchInput}
              value={assignDate}
              onChange={e => setAssignDate(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Photo</label>
            <div style={{
              border: '2px dashed #EEE', borderRadius: 'var(--radius-lg)', padding: '20px',
              textAlign: 'center', background: 'var(--bg-body)', cursor: 'pointer', position: 'relative'
            }}>
              <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '10px' }} />
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Click to add photo</p>
              <input
                type="file"
                accept="image/*"
                onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
              />
              {file && <p style={{ marginTop: '10px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{file.name}</p>}
            </div>
          </div>

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