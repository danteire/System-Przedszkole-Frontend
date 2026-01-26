import React from "react";
import { type MealDTO } from "./mealTypes";
import styles from "./MealsPage.module.css";
import { X, Info, Utensils } from "lucide-react";
// Upewnij się, że importujesz SecureAnnouncementImage lub SecureImage (zależnie jak nazwałeś komponent w utils)
import { SecureAnnouncementImage } from "~/utils/SecureAnnouncementImage";

interface MealDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: MealDTO | null;
}

export const MealDetailsModal: React.FC<MealDetailsModalProps> = ({ isOpen, onClose, meal }) => {
  if (!isOpen || !meal) return null;

  const typeMap: Record<string, string> = {
    BREAKFAST: "Breakfast",
    LUNCH: "Lunch",
    DINNER: "Dinner",
    SNACK: "Snack"
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Meal Details</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* NAME */}
          <div>
            <span className={styles.detailLabel}>Name</span>
            <div className={styles.detailValueLarge}>{meal.name}</div>
          </div>

          {/* TYPE */}
          <div>
            <span className={styles.detailLabel}>Type</span>
            <div className={styles.typeBadge}>
              {typeMap[meal.type] || meal.type}
            </div>
          </div>

          {/* INFO */}
          <div>
            <span className={styles.detailLabel} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Info size={14} /> Info (Allergens, Kcal)
            </span>
            <div className={styles.infoBox}>
              {meal.info || <span style={{ color: '#a0aec0', fontStyle: 'italic' }}>No additional info</span>}
            </div>
          </div>

          {/* PHOTO */}
          <div>
            <span className={styles.detailLabel}>Photo</span>
            
            {/* Kontener o stałej wysokości */}
            <div className={styles.detailImageContainer}>
              {meal.imagePath ? (
                <SecureAnnouncementImage 
                  imagePath={meal.imagePath} 
                  alt={meal.name}
                  // Obrazek dopasuje się do kontenera (contain)
                  className={styles.modalImageFull}
                />
              ) : (
                <div className={styles.noImagePlaceholder}>
                  <Utensils size={32} />
                  <span>No photo</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button type="button" onClick={onClose} className={styles.submitButton}>Close</button>
        </div>
      </div>
    </div>
  );
};