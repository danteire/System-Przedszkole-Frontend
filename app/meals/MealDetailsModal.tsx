// app/meals/MealDetailsModal.tsx
import React from "react";
import { type MealDTO } from "./mealTypes";
import styles from "./MealsPage.module.css";
import { X, Info, Utensils } from "lucide-react";
import { api } from "~/utils/serviceAPI";

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

  const imageUrl = api.getMealImageUrl(meal.imagePath);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className={styles.modalTitle} style={{ fontSize: '1.5rem' }}>Meal Details</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <span className={styles.detailLabel} style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Name</span>
            <div className={styles.detailValue} style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>{meal.name}</div>
          </div>

          <div>
            <span className={styles.detailLabel} style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Type</span>
            <div className={styles.detailValue} style={{ display: 'inline-block', padding: '4px 12px', background: 'var(--bg-body)', borderRadius: 'var(--radius-full)', fontWeight: 'bold', color: 'var(--color-primary)' }}>
              {typeMap[meal.type] || meal.type}
            </div>
          </div>

          <div>
            <span className={styles.detailLabel} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <Info size={14} /> Info (Allergens, Kcal)
            </span>
            <div className={styles.detailValue} style={{ padding: '10px', background: 'var(--bg-body)', borderRadius: 'var(--radius-lg)' }}>
              {meal.info || <span style={{ color: '#a0aec0', fontStyle: 'italic' }}>No additional info</span>}
            </div>
          </div>

          <div>
            <span className={styles.detailLabel} style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Photo</span>
            <div className={styles.detailImageContainer} style={{ width: '100%', height: '200px', background: '#f7f9fc', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={meal.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<span style="color:#CBD5E0">Image load error</span>';
                  }}
                />
              ) : (
                <div style={{ color: '#CBD5E0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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