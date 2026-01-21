import React from "react";
import { type MealDTO } from "./mealTypes";
import styles from "./MealsPage.module.css";

interface MealCardProps {
  meal: MealDTO | null;
  typeLabel: string;
  icon: React.ReactNode;
  iconClass: string;
  onCardClick?: (meal: MealDTO) => void;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, typeLabel, icon, iconClass, onCardClick }) => {
  if (!meal) {
    return (
      <div className={styles.mealCard}>
        <div className={`${styles.mealTypeLabel} ${iconClass}`}>
          {icon} {typeLabel}
        </div>
        <div className={styles.emptyMeal}>Brak planu</div>
      </div>
    );
  }

  // Obsługa kliknięcia
  const handleClick = () => {
      if (onCardClick) {
          onCardClick(meal);
      }
  };

  return (
    <div 
        className={`${styles.mealCard} ${styles.mealCardClickable}`} 
        onClick={handleClick}
    >
      <div className={`${styles.mealTypeLabel} ${iconClass}`}>
        {icon} {typeLabel}
      </div>
      <div className={styles.mealName}>{meal.name}</div>
      {meal.info && <div className={styles.mealInfo}>{meal.info}</div>}
    </div>
  );
};