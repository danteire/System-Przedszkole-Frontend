import React, { useEffect, useState } from "react";
import { type MealDTO, type MenuPlanResponseDTO, MealType } from "./mealTypes";
import styles from "./MealsPage.module.css";

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
        alert("Błąd zapisu planu.");
    } finally {
        setSaving(false);
    }
  };

  const renderSelect = (label: string, value: string, setValue: (v: string) => void, options: MealDTO[]) => (
      <div className={styles.formGroup}>
          <label className={styles.label}>{label}</label>
          <select 
              value={value} 
              onChange={(e) => setValue(e.target.value)} 
              className={styles.select}
          >
              <option value="">-- Brak / Wybierz --</option>
              {options.map(meal => (
                  <option key={meal.id} value={meal.id}>{meal.name}</option>
              ))}
          </select>
      </div>
  );

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
           <h2 className={styles.modalTitle}>Edytuj plan: {new Date(date).toLocaleDateString()}</h2>
        </div>
        <form onSubmit={handleSubmit}>
           {renderSelect("Śniadanie", breakfastId, setBreakfastId, breakfasts)}
           {renderSelect("Obiad", lunchId, setLunchId, lunches)}
           {renderSelect("Podwieczorek", snackId, setSnackId, snacks)}
           {renderSelect("Kolacja", dinnerId, setDinnerId, dinners)}
           
           <div className={styles.modalActions}>
              <button type="button" onClick={onClose} className={styles.cancelButton} disabled={saving}>Anuluj</button>
              <button type="submit" className={styles.submitButton} disabled={saving}>
                  {saving ? "Zapisywanie..." : "Zapisz plan"}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};