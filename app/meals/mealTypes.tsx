
export enum MealType {
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH",
  DINNER = "DINNER",
  SNACK = "SNACK"
}

export interface MealDTO {
  id: number;
  type: MealType;
  name: string;
  info: string;
  imagePath?: string;
}

export interface MenuPlanResponseDTO {
  id: number;
  date: string; // ISO Date string (YYYY-MM-DD)
  breakfast: MealDTO | null;
  lunch: MealDTO | null;
  dinner: MealDTO | null;
  snack: MealDTO | null;
}