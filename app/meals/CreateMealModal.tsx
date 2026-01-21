import React, { useEffect, useState } from "react";
import { MealType } from "./mealTypes";
import styles from "./MealsPage.module.css";

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
      alert("Nie udało się utworzyć posiłku.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
           <h2 className={styles.modalTitle}>Dodaj nowy posiłek do bazy</h2>
        </div>
        <form onSubmit={handleSubmit}>
           <div className={styles.formGroup}>
             <label className={styles.label}>Nazwa posiłku</label>
             <input 
               type="text" 
               className={styles.select}
               value={name}
               onChange={e => setName(e.target.value)}
               placeholder="np. Owsianka z owocami"
               required
             />
           </div>

           <div className={styles.formGroup}>
             <label className={styles.label}>Typ posiłku</label>
             <select 
               className={styles.select}
               value={type}
               onChange={e => setType(e.target.value as MealType)}
             >
               <option value={MealType.BREAKFAST}>Śniadanie</option>
               <option value={MealType.LUNCH}>Obiad</option>
               <option value={MealType.SNACK}>Podwieczorek</option>
               <option value={MealType.DINNER}>Kolacja</option>
             </select>
           </div>

           <div className={styles.formGroup}>
             <label className={styles.label}>Informacje (alergeny, kcal)</label>
             <input 
               type="text" 
               className={styles.select}
               value={info}
               onChange={e => setInfo(e.target.value)}
               placeholder="np. Zawiera gluten, mleko"
             />
           </div>
           
            <div className={styles.formGroup} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '15px' }}>
             <label className={styles.label}>Przypisz od razu do dnia (opcjonalne)</label>
             <input 
               type="date" 
               className={styles.select}
               value={assignDate}
               onChange={e => setAssignDate(e.target.value)}
             />
             <p style={{fontSize: '0.8rem', color: '#718096', marginTop: '5px'}}>
                Jeśli wybierzesz datę, posiłek zostanie automatycznie dodany do planu jako {type === 'BREAKFAST' ? 'śniadanie' : type === 'LUNCH' ? 'obiad' : type === 'SNACK' ? 'podwieczorek' : 'kolacja'}.
             </p>
           </div>

           <div className={styles.formGroup}>
             <label className={styles.label}>Zdjęcie (opcjonalne)</label>
             <input 
               type="file" 
               className={styles.fileInput}
               accept="image/*"
               onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
             />
           </div>
           
           <div className={styles.modalActions}>
              <button type="button" onClick={onClose} className={styles.cancelButton} disabled={saving}>Anuluj</button>
              <button type="submit" className={styles.submitButton} disabled={saving}>
                  {saving ? "Tworzenie..." : "Utwórz posiłek"}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};