import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { User } from "lucide-react";
import styles from "./AttendanceView.module.css";
import type { Preschooler, AttendanceRecord, Group } from "./attendanceTypes";

// Import komponentów
import { ChildrenList } from "./components/ChildrenList";
import { AttendanceHistory } from "./components/AttendanceHistory";
import { ExcuseAbsenceModal } from "./components/ExcuseAbsenceModal";

export default function ParentAttendanceView() {
  const [children, setChildren] = useState<Preschooler[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [groupsMap, setGroupsMap] = useState<Map<number, string>>(new Map());
  
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Modal state
  const [isExcuseModalOpen, setIsExcuseModalOpen] = useState(false);

  // 1. Fetch Groups & Children on mount
  useEffect(() => {
    const initData = async () => {
      setLoadingChildren(true);
      try {
        // --- A. Pobranie Grup ---
        try {
            const groupResponse = await api.get<Group[]>("/groups");
            // Obsługa formatu { data: [] } lub []
            const groupsData = Array.isArray(groupResponse) 
                ? groupResponse 
                : (groupResponse as any).data || [];
            
            setGroupsMap(new Map(groupsData.map((g: Group) => [g.id, g.groupName])));
        } catch (e) {
            console.warn("Could not fetch groups map", e);
        }

        // --- B. Pobranie Dzieci ---
        const accountInfo = api.getAccountInfo();
        if (accountInfo?.id) {
          const childResponse = await api.get<Preschooler[]>(`/preschoolers/parent/${accountInfo.id}`);
          
          const childData = Array.isArray(childResponse) 
            ? childResponse 
            : (childResponse as any).data || [];

          setChildren(childData);
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoadingChildren(false);
      }
    };

    initData();
  }, []);

  // 2. Fetch History Function
  const fetchHistory = async () => {
    if (!selectedChildId) return;
    
    setLoadingHistory(true);
    setAttendanceHistory([]); // Wyczyść poprzednie dane przed ładowaniem
    
    try {
      console.log(`📥 Pobieranie historii dla dziecka ID: ${selectedChildId}...`);
      
      const response = await api.get<AttendanceRecord[] | { data: AttendanceRecord[] }>(`/attendance/preschooler/${selectedChildId}`);
      
      console.log("📦 Odpowiedź API (History):", response);

      // --- FIX: Obsługa różnych formatów odpowiedzi API ---
      let rawData: AttendanceRecord[] = [];
      
      if (Array.isArray(response)) {
          rawData = response;
      } else if (response && 'data' in response && Array.isArray(response.data)) {
          rawData = response.data;
      } else {
          console.warn("⚠️ Nieoczekiwany format danych historii:", response);
          rawData = [];
      }

      if (rawData.length > 0) {
          const sorted = rawData.sort((a, b) => {
              const dateA = a.date ? new Date(a.date).getTime() : 0;
              const dateB = b.date ? new Date(b.date).getTime() : 0;
              return dateB - dateA; // Od najnowszych
          });
          setAttendanceHistory(sorted);
      } else {
          setAttendanceHistory([]);
      }

    } catch (error) {
      console.error("❌ Błąd pobierania historii:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Trigger history fetch whenever selectedChildId changes
  useEffect(() => {
    fetchHistory();
  }, [selectedChildId]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
         <User size={32} color="#4a5568" />
         <h2 className={styles.title}>My Children</h2>
      </div>

      <ChildrenList 
          children={children}
          selectedChildId={selectedChildId}
          onSelect={setSelectedChildId}
          loading={loadingChildren}
          groupsMap={groupsMap}
      />

      {selectedChildId && (
          <AttendanceHistory 
              history={attendanceHistory}
              loading={loadingHistory}
              onOpenExcuseModal={() => setIsExcuseModalOpen(true)}
          />
      )}

      {selectedChildId && (
        <ExcuseAbsenceModal 
            isOpen={isExcuseModalOpen}
            onClose={() => setIsExcuseModalOpen(false)}
            onSuccess={() => fetchHistory()} // Odśwież po zapisaniu zwolnienia
            childId={selectedChildId}
        />
      )}
    </div>
  );
}