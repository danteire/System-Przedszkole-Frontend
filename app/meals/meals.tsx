import React, { useEffect, useState } from "react";
import DashBoard from "~/commons/dashboard";
import { api } from "~/utils/serviceAPI"; 
import styles from "./MealsPage.module.css";
import { type MealDTO, type MenuPlanResponseDTO, MealType } from "./mealTypes";
import { RefreshCw, Plus } from "lucide-react";

// Importy nowych komponentów
import { DayColumn } from "./DayColumn";
import { MenuEditModal } from "./MenuEditModal";
import { CreateMealModal } from "./CreateMealModal";
import { MealDetailsModal } from "./MealDetailsModal";

export default function MealsPage() {
  const [weeklyMenu, setWeeklyMenu] = useState<{ date: string, plan: MenuPlanResponseDTO | null }[]>([]);
  const [availableMeals, setAvailableMeals] = useState<MealDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Stan Modali
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
      console.error("Błąd podczas pobierania jadłospisu:", error);
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
              console.error("Nie udało się pobrać listy posiłków");
          }
      }
  };

  useEffect(() => {
    fetchWeekMenu();
    fetchAllMeals(); 
  }, []);

  // API Handler: Zapis planu
  const handleSavePlan = async (date: string, breakfastId: number|null, lunchId: number|null, dinnerId: number|null, snackId: number|null) => {
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

  // API Handler: Utworzenie posiłku
 const handleCreateMeal = async (name: string, type: MealType, info: string, file: File | null, assignDate: string) => {
      const formData = new FormData();
      const mealDto = { name, type, info };
      
      const jsonBlob = new Blob([JSON.stringify(mealDto)], { type: "application/json" });
      formData.append("data", jsonBlob);

      if (file) {
          formData.append("image", file);
      }

      // 1. Utwórz posiłek i odbierz utworzony obiekt (żeby mieć ID)
      const createdMeal = await api.upload<MealDTO>("/meals", formData);

      // 2. Jeśli wybrano datę, przypisz ten posiłek do planu
      if (assignDate && createdMeal?.id) {
          try {
              // a) Pobierz aktualny plan na ten dzień (żeby nie nadpisać innych posiłków nullami)
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
                  // Ignorujemy 404 - po prostu tworzymy nowy plan
                  console.log("Tworzę nowy plan dla daty: " + assignDate);
              }

              // b) Podstaw ID nowego posiłku w odpowiednie miejsce
              switch (type) {
                  case MealType.BREAKFAST: currentPlanRequest.breakfastId = createdMeal.id; break;
                  case MealType.LUNCH: currentPlanRequest.lunchId = createdMeal.id; break;
                  case MealType.DINNER: currentPlanRequest.dinnerId = createdMeal.id; break;
                  case MealType.SNACK: currentPlanRequest.snackId = createdMeal.id; break;
              }

              // c) Zapisz zaktualizowany plan
              await api.post("/menu", currentPlanRequest);
              
          } catch (e) {
              console.error("Udało się utworzyć posiłek, ale wystąpił błąd przy przypisywaniu do daty.", e);
              alert("Posiłek utworzony, ale nie udało się go przypisać do daty automatycznie.");
          }
      }

      // 3. Odśwież dane
      await fetchAllMeals();
      if (assignDate) {
          await fetchWeekMenu(); // Odśwież widok tygodnia, bo mogliśmy zmienić plan
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
              <h1 className={styles.title}>Jadłospis tygodniowy</h1>
              <p className={styles.subtitle}>
                Plan żywieniowy na bieżący tydzień.
              </p>
            </div>
            
            {canEdit && (
                <button onClick={() => setIsCreateOpen(true)} className={styles.createButton}>
                    <Plus size={18} /> Dodaj nowy posiłek
                </button>
            )}
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
                <RefreshCw className="animate-spin" /> Ładowanie jadłospisu...
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