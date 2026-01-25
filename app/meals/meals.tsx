// app/meals/meals.tsx
import React, { useEffect, useState } from "react";
import DashBoard from "~/commons/dashboard";
import { api } from "~/utils/serviceAPI";
import styles from "./MealsPage.module.css";
import { type MealDTO, type MenuPlanResponseDTO, MealType } from "./mealTypes";
import { RefreshCw, Plus } from "lucide-react";

// Import new components
import { DayColumn } from "./DayColumn";
import { MenuEditModal } from "./MenuEditModal";
import { CreateMealModal } from "./CreateMealModal";
import { MealDetailsModal } from "./MealDetailsModal";

export default function MealsPage() {
  const [weeklyMenu, setWeeklyMenu] = useState<{ date: string, plan: MenuPlanResponseDTO | null }[]>([]);
  const [availableMeals, setAvailableMeals] = useState<MealDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [viewingMeal, setViewingMeal] = useState<MealDTO | null>(null);

  const [editingDate, setEditingDate] = useState<string>("");
  const [editingPlan, setEditingPlan] = useState<MenuPlanResponseDTO | null>(null);

  const accountType = api.getAccountType();
  const canEdit = accountType === "ADMIN" || accountType === "TEACHER";

  const getCurrentWeekDays = () => {
    const curr = new Date();
    const week = [];
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(curr.setDate(diff));

    for (let i = 0; i < 5; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      week.push(day.toISOString().split('T')[0]);
    }
    return week;
  };

  const fetchWeekMenu = async () => {
    setLoading(true);
    const days = getCurrentWeekDays();
    try {
      const promises = days.map(async (date) => {
        try {
          const data = await api.get<MenuPlanResponseDTO>(`/menu/${date}`);
          return { date, plan: data };
        } catch (error) {
          return { date, plan: null };
        }
      });
      const results = await Promise.all(promises);
      setWeeklyMenu(results);
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMeals = async () => {
    if (canEdit) {
      try {
        const meals = await api.get<MealDTO[]>("/meals");
        setAvailableMeals(meals);
      } catch (e) {
        console.error("Failed to fetch meals list");
      }
    }
  };

  useEffect(() => {
    fetchWeekMenu();
    fetchAllMeals();
  }, []);

  // API Handler: Save Plan
  const handleSavePlan = async (date: string, breakfastId: number | null, lunchId: number | null, dinnerId: number | null, snackId: number | null) => {
    const payload = {
      date: date,
      breakfastId: breakfastId,
      lunchId: lunchId,
      dinnerId: dinnerId,
      snackId: snackId
    };
    await api.post("/menu", payload);
    await fetchWeekMenu();
  };

  // API Handler: Create Meal
  const handleCreateMeal = async (name: string, type: MealType, info: string, file: File | null, assignDate: string) => {
    const formData = new FormData();
    const mealDto = { name, type, info };

    const jsonBlob = new Blob([JSON.stringify(mealDto)], { type: "application/json" });
    formData.append("meal", jsonBlob); // Fix: Matches @RequestPart("meal")

    if (file) {
      formData.append("file", file); // Fix: Matches @RequestPart("file")
    }

    // 1. Create meal
    const createdMeal = await api.upload<MealDTO>("/meals", formData);

    // 2. If date assigned, assign to plan
    if (assignDate && createdMeal?.id) {
      try {
        // a) Get current plan
        let currentPlanRequest = {
          date: assignDate,
          breakfastId: null as number | null,
          lunchId: null as number | null,
          dinnerId: null as number | null,
          snackId: null as number | null
        };

        try {
          const existingPlan = await api.get<MenuPlanResponseDTO>(`/menu/${assignDate}`);
          if (existingPlan) {
            currentPlanRequest.breakfastId = existingPlan.breakfast?.id || null;
            currentPlanRequest.lunchId = existingPlan.lunch?.id || null;
            currentPlanRequest.dinnerId = existingPlan.dinner?.id || null;
            currentPlanRequest.snackId = existingPlan.snack?.id || null;
          }
        } catch (e) {
          // Ignore 404
          console.log("Creating new plan for date: " + assignDate);
        }

        // b) Assign new meal ID
        switch (type) {
          case MealType.BREAKFAST: currentPlanRequest.breakfastId = createdMeal.id; break;
          case MealType.LUNCH: currentPlanRequest.lunchId = createdMeal.id; break;
          case MealType.DINNER: currentPlanRequest.dinnerId = createdMeal.id; break;
          case MealType.SNACK: currentPlanRequest.snackId = createdMeal.id; break;
        }

        // c) Save updated plan
        await api.post("/menu", currentPlanRequest);

      } catch (e) {
        console.error("Meal created but failed to assign to date automatically.", e);
        alert("Meal created, but automatic assignment to date failed.");
      }
    }

    // 3. Refresh data
    await fetchAllMeals();
    if (assignDate) {
      await fetchWeekMenu();
    }
  };

  const openEditModal = (date: string, plan: MenuPlanResponseDTO | null) => {
    setEditingDate(date);
    setEditingPlan(plan);
    setIsEditOpen(true);
  };

  const handleMealClick = (meal: MealDTO) => {
    setViewingMeal(meal);
  };

  return (
    <>
      <DashBoard />
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Weekly Menu</h1>
            <p className={styles.subtitle}>
              Nutrition plan for the current week.
            </p>
          </div>

          {canEdit && (
            <button onClick={() => setIsCreateOpen(true)} className={styles.createButton}>
              <Plus size={18} /> Add New Meal
            </button>
          )}
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <RefreshCw className="animate-spin" /> Loading menu...
          </div>
        ) : (
          <div className={styles.weekGrid}>
            {weeklyMenu.map((dayItem) => (
              <DayColumn
                key={dayItem.date}
                date={dayItem.date}
                plan={dayItem.plan}
                canEdit={canEdit}
                onEdit={() => openEditModal(dayItem.date, dayItem.plan)}
                onMealClick={handleMealClick}
              />
            ))}
          </div>
        )}

        <MenuEditModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          date={editingDate}
          currentPlan={editingPlan}
          allMeals={availableMeals}
          onSave={handleSavePlan}
        />

        <CreateMealModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSave={handleCreateMeal}
        />
        <MealDetailsModal
          isOpen={!!viewingMeal}
          onClose={() => setViewingMeal(null)}
          meal={viewingMeal}
        />
      </div>
    </>
  );
}