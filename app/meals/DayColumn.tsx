import React from "react";
import { type MenuPlanResponseDTO,type MealDTO } from "./mealTypes";
import styles from "./MealsPage.module.css";
import { Edit2, Coffee, Sun, Cookie, Moon } from "lucide-react";
import { MealCard } from "./MealCard";

interface DayColumnProps {
  date: string; 
  plan: MenuPlanResponseDTO | null;
  canEdit: boolean;
  onEdit: () => void;
  // NOWE:
  onMealClick: (meal: MealDTO) => void;
}

export const DayColumn: React.FC<DayColumnProps> = ({ date, plan, canEdit, onEdit, onMealClick }) => {
  const dayName = new Date(date).toLocaleDateString("pl-PL", { weekday: "long" });
  const formattedDate = new Date(date).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" });

  const safePlan = plan || { breakfast: null, lunch: null, dinner: null, snack: null };

  return (
    <div className={styles.dayColumn}>
      <div className={styles.dayHeader}>
        <span className={styles.dayName}>{dayName}</span>
        <span className={styles.dayDate}>{formattedDate}</span>
        
        {canEdit && (
            <button onClick={onEdit} className={styles.editButton} title="Edytuj posiłki">
                <Edit2 size={16} />
            </button>
        )}
      </div>
      <div className={styles.dayContent}>
        <MealCard 
            meal={safePlan.breakfast} 
            typeLabel="Śniadanie" 
            icon={<Coffee size={14}/>} 
            iconClass={styles.iconBreakfast} 
            onCardClick={onMealClick} // Przekazanie
        />
        <MealCard 
            meal={safePlan.lunch} 
            typeLabel="Obiad" 
            icon={<Sun size={14}/>} 
            iconClass={styles.iconLunch} 
            onCardClick={onMealClick} // Przekazanie
        />
        <MealCard 
            meal={safePlan.snack} 
            typeLabel="Podwieczorek" 
            icon={<Cookie size={14}/>} 
            iconClass={styles.iconSnack} 
            onCardClick={onMealClick} // Przekazanie
        />
        <MealCard 
            meal={safePlan.dinner} 
            typeLabel="Kolacja" 
            icon={<Moon size={14}/>} 
            iconClass={styles.iconDinner} 
            onCardClick={onMealClick} // Przekazanie
        />
      </div>
    </div>
  );
};