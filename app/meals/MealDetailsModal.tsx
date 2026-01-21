import React from "react";
import {type MealDTO } from "./mealTypes";
import styles from "./MealsPage.module.css";
import { X } from "lucide-react";

interface MealDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: MealDTO | null;
}

export const MealDetailsModal: React.FC<MealDetailsModalProps> = ({ isOpen, onClose, meal }) => {
  if (!isOpen || !meal) return null;

  // Tłumaczenie typów na polski (opcjonalne, jeśli masz to w enumie)
  const typeMap: Record<string, string> = {
    BREAKFAST: "Śniadanie",
    LUNCH: "Obiad",
    DINNER: "Kolacja",
    SNACK: "Podwieczorek"
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <h2 className={styles.modalTitle}>Szczegóły posiłku</h2>
           <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#718096' }}>
               <X size={24} />
           </button>
        </div>

        <div>
            <span className={styles.detailLabel}>Nazwa</span>
            <div className={styles.detailValue} style={{ fontWeight: 600 }}>{meal.name}</div>

            <span className={styles.detailLabel}>Typ posiłku</span>
            <div className={styles.detailValue}>{typeMap[meal.type] || meal.type}</div>

            <span className={styles.detailLabel}>Informacje (alergeny, kcal)</span>
            <div className={styles.detailValue}>
                {meal.info || <span style={{ color: '#a0aec0', fontStyle: 'italic' }}>Brak dodatkowych informacji</span>}
            </div>

            <span className={styles.detailLabel}>Zdjęcie</span>
            <div className={styles.detailImageContainer}>
                {meal.imagePath ? (
                    // Zakładamy, że imagePath to URL dostępny dla frontendu. 
                    // Jeśli to tylko nazwa pliku, musisz dodać prefix backendu, np: `http://localhost:8080/uploads/${meal.imagePath}`
                    <img 
                        src={meal.imagePath} 
                        alt={meal.name} 
                        className={styles.detailImage}
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'; // Ukryj jeśli błąd ładowania
                        }}
                    />
                ) : (
                    <div className={styles.noImagePlaceholder}>Brak zdjęcia</div>
                )}
            </div>
        </div>

        <div className={styles.modalActions}>
           <button type="button" onClick={onClose} className={styles.submitButton}>Zamknij</button>
        </div>
      </div>
    </div>
  );
};