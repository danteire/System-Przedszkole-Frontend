// app/meals/meals.tsx
import React, { useEffect, useState, useCallback } from "react";
import DashBoard from "~/commons/dashboard";
import { api } from "~/utils/serviceAPI";
import styles from "./MealsPage.module.css";
import { type MealDTO, type MenuPlanResponseDTO, MealType } from "./mealTypes";
import { RefreshCw, Plus, ChevronLeft, ChevronRight } from "lucide-react";

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

  // --- LOGIKA DAT I NAWIGACJI ---

  const getInitialMonday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Niedziela, 6 = Sobota
    const target = new Date(today);

    if (dayOfWeek === 0) {
      target.setDate(today.getDate() + 1);
    } else if (dayOfWeek === 6) {
      target.setDate(today.getDate() + 2);
    } else {
      const diff = today.getDate() - dayOfWeek + 1;
      target.setDate(diff);
    }
    return target;
  };

  const [currentMonday, setCurrentMonday] = useState<Date>(getInitialMonday);

  const accountType = api.getAccountType();
  const canEdit = accountType === "ADMIN" || accountType === "TEACHER";

  const getWeekDays = useCallback((monday: Date) => {
    const week = [];
    for (let i = 0; i < 5; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      week.push(day.toISOString().split('T')[0]);
    }
    return week;
  }, []);

  const fetchWeekMenu = useCallback(async () => {
    setLoading(true);
    const days = getWeekDays(currentMonday);
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
  }, [currentMonday, getWeekDays]);

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

  const changeWeek = (direction: number) => {
    const newDate = new Date(currentMonday);
    newDate.setDate(currentMonday.getDate() + (direction * 7));
    setCurrentMonday(newDate);
  };

  useEffect(() => {
    fetchWeekMenu();
    if (availableMeals.length === 0) fetchAllMeals();
  }, [fetchWeekMenu]); 

  const formatWeekRange = () => {
    const endOfWeek = new Date(currentMonday);
    endOfWeek.setDate(currentMonday.getDate() + 4); 
    
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' };
    return `${currentMonday.toLocaleDateString('pl-PL', options)} - ${endOfWeek.toLocaleDateString('pl-PL', options)}`;
  };

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

  const handleCreateMeal = async (name: string, type: MealType, info: string, file: File | null, assignDate: string) => {
    const formData = new FormData();
    const mealDto = { name, type, info };

    const jsonBlob = new Blob([JSON.stringify(mealDto)], { type: "application/json" });
    formData.append("meal", jsonBlob);

    if (file) {
      formData.append("file", file);
    }

    const createdMeal = await api.upload<MealDTO>("/meals", formData);

    if (assignDate && createdMeal?.id) {
      try {
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
          console.log("Creating new plan for date: " + assignDate);
        }

        switch (type) {
          case MealType.BREAKFAST: currentPlanRequest.breakfastId = createdMeal.id; break;
          case MealType.LUNCH: currentPlanRequest.lunchId = createdMeal.id; break;
          case MealType.DINNER: currentPlanRequest.dinnerId = createdMeal.id; break;
          case MealType.SNACK: currentPlanRequest.snackId = createdMeal.id; break;
        }

        await api.post("/menu", currentPlanRequest);

      } catch (e) {
        console.error("Meal created but failed to assign to date automatically.", e);
        alert("Meal created, but automatic assignment to date failed.");
      }
    }

    await fetchAllMeals();
    if (assignDate) {
        const days = getWeekDays(currentMonday);
        if (days.includes(assignDate)) {
            await fetchWeekMenu();
        }
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
        
        {/* --- HEADER: Left/Right Arrows + Centered Text --- */}
        <div className={styles.header}>
          
          {/* Left Arrow */}
          <button 
              onClick={() => changeWeek(-1)} 
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Previous Week"
          >
              <ChevronLeft size={28} color="white" />
          </button>

          {/* Center Info */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h1 className={styles.title} style={{ marginBottom: '4px' }}>Weekly Menu</h1>
            <span className={styles.subtitle} style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'block' }}>
                {formatWeekRange()}
            </span>
          </div>

          {/* Right Arrow */}
          <button 
              onClick={() => changeWeek(1)} 
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Next Week"
          >
              <ChevronRight size={28} color="white" />
          </button>

        </div>

        {/* Add Meal Button (Outside Header or Below) */}
        {canEdit && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button onClick={() => setIsCreateOpen(true)} className={styles.createButton}>
                <Plus size={18} /> Add New Meal
                </button>
            </div>
        )}

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