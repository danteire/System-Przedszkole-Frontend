// app/meals/DayColumn.tsx
import React from "react";
import { type MenuPlanResponseDTO, type MealDTO } from "./mealTypes";
import styles from "./MealsPage.module.css";
import { Edit2, Coffee, Sun, Cookie, Moon } from "lucide-react";
import { MealCard } from "./MealCard";

interface DayColumnProps {
  date: string;
  plan: MenuPlanResponseDTO | null;
  canEdit: boolean;
  onEdit: () => void;
  onMealClick: (meal: MealDTO) => void;
}

export const DayColumn: React.FC<DayColumnProps> = ({ date, plan, canEdit, onEdit, onMealClick }) => {
  // Using English locale for dates
  const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }); // DD.MM

  const safePlan = plan || { breakfast: null, lunch: null, dinner: null, snack: null };

  return (
    <div className={styles.dayColumn}>
      <div className={styles.dayHeader}>
        <span className={styles.dayName}>{dayName}</span>
        <span className={styles.dayDate}>{formattedDate}</span>

        {canEdit && (
          <button onClick={onEdit} className={styles.editButton} title="Edit Meals">
            <Edit2 size={16} />
          </button>
        )}
      </div>
      <div className={styles.dayContent}>
        <MealCard
          meal={safePlan.breakfast}
          typeLabel="Breakfast"
          icon={<Sun size={14} />}
          iconClass={styles.iconBreakfast}
          onCardClick={onMealClick}
        />
        <MealCard
          meal={safePlan.lunch}
          typeLabel="Lunch"
          icon={<UtensilsIcon size={14} />}
          iconClass={styles.iconLunch}
          onCardClick={onMealClick}
        />
        <MealCard
          meal={safePlan.snack}
          typeLabel="Snack"
          icon={<Coffee size={14} />}
          iconClass={styles.iconSnack}
          onCardClick={onMealClick}
        />
        <MealCard
          meal={safePlan.dinner}
          typeLabel="Dinner"
          icon={<Moon size={14} />}
          iconClass={styles.iconDinner}
          onCardClick={onMealClick}
        />
      </div>
    </div>
  );
};

// Simple Utensils Icon wrapper or reusing lucide
import { Utensils as UtensilsIcon } from "lucide-react";