// app/meals/MenuEditModal.tsx
import React, { useEffect, useState } from "react";
import { type MealDTO, type MenuPlanResponseDTO, MealType } from "./mealTypes";
import styles from "./MealsPage.module.css";
import { X, Sun, Moon, Coffee, Utensils } from "lucide-react";

interface MenuEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  currentPlan: MenuPlanResponseDTO | null;
  allMeals: MealDTO[];
  onSave: (date: string, breakfastId: number | null, lunchId: number | null, dinnerId: number | null, snackId: number | null) => Promise<void>;
}

export const MenuEditModal: React.FC<MenuEditModalProps> = ({ isOpen, onClose, date, currentPlan, allMeals, onSave }) => {
  const [breakfastId, setBreakfastId] = useState<string>("");
  const [lunchId, setLunchId] = useState<string>("");
  const [dinnerId, setDinnerId] = useState<string>("");
  const [snackId, setSnackId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBreakfastId(currentPlan?.breakfast?.id?.toString() || "");
      setLunchId(currentPlan?.lunch?.id?.toString() || "");
      setDinnerId(currentPlan?.dinner?.id?.toString() || "");
      setSnackId(currentPlan?.snack?.id?.toString() || "");
    }
  }, [isOpen, currentPlan]);

  if (!isOpen) return null;

  const breakfasts = allMeals.filter(m => m.type === MealType.BREAKFAST);
  const lunches = allMeals.filter(m => m.type === MealType.LUNCH);
  const dinners = allMeals.filter(m => m.type === MealType.DINNER);
  const snacks = allMeals.filter(m => m.type === MealType.SNACK);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(
        date,
        breakfastId ? parseInt(breakfastId) : null,
        lunchId ? parseInt(lunchId) : null,
        dinnerId ? parseInt(dinnerId) : null,
        snackId ? parseInt(snackId) : null
      );
      onClose();
    } catch (error) {
      alert("Failed to save plan.");
    } finally {
      setSaving(false);
    }
  };

  const renderSelect = (label: string, value: string, setValue: (v: string) => void, options: MealDTO[], icon: React.ReactNode) => (
    <div className={styles.formGroup}>
      <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--color-primary)' }}>{icon}</span>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={styles.select}
          style={{
            width: '100%',
            appearance: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '12px 20px',
            border: '2px solid #E2E8F0',
            background: 'white',
            fontWeight: 'bold',
            color: 'var(--text-main)'
          }}
        >
          <option value="">-- None / Select --</option>
          {options.map(meal => (
            <option key={meal.id} value={meal.id}>{meal.name}</option>
          ))}
        </select>
        {/* Custom arrow logic via CSS or simple character */}
        <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
          ▼
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <div className={styles.modalHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className={styles.modalTitle} style={{ fontSize: '1.5rem' }}>Edit Plan: {new Date(date).toLocaleDateString("en-GB")}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {renderSelect("Breakfast", breakfastId, setBreakfastId, breakfasts, <Sun size={18} />)}
          {renderSelect("Lunch", lunchId, setLunchId, lunches, <Utensils size={18} />)}
          {renderSelect("Snack", snackId, setSnackId, snacks, <Coffee size={18} />)}
          {renderSelect("Dinner", dinnerId, setDinnerId, dinners, <Moon size={18} />)}

          <div className={styles.modalActions} style={{ marginTop: '20px' }}>
            <button type="button" onClick={onClose} className={styles.cancelButton} disabled={saving}>Cancel</button>
            <button type="submit" className={styles.submitButton} disabled={saving}>
              {saving ? "Saving..." : "Save Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};