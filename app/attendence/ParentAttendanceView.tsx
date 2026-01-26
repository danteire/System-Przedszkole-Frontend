import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { User, Users } from "lucide-react"; // Zmieniona ikona
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

  const [isExcuseModalOpen, setIsExcuseModalOpen] = useState(false);

  useEffect(() => {
    const initData = async () => {
      setLoadingChildren(true);
      try {
        try {
            const groupResponse = await api.get<Group[]>("/groups");
            const groupsData = Array.isArray(groupResponse) 
                ? groupResponse 
                : (groupResponse as any).data || [];
            
            setGroupsMap(new Map(groupsData.map((g: Group) => [g.id, g.groupName])));
        } catch (e) {
            console.warn("Could not fetch groups map", e);
        }

        const accountInfo = api.getAccountInfo();
        if (accountInfo?.id) {
          const childResponse = await api.get<Preschooler[]>(`/preschoolers/parent/${accountInfo.id}`);
          const childData = Array.isArray(childResponse) 
            ? childResponse 
            : (childResponse as any).data || [];

          setChildren(childData);
          
          // Opcjonalnie: automatycznie wybierz pierwsze dziecko
          if (childData.length > 0) {
              setSelectedChildId(childData[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoadingChildren(false);
      }
    };

    initData();
  }, []);

  const fetchHistory = async () => {
    if (!selectedChildId) return;
    
    setLoadingHistory(true);
    setAttendanceHistory([]); 
    
    try {
      const response = await api.get<AttendanceRecord[] | { data: AttendanceRecord[] }>(`/attendance/preschooler/${selectedChildId}`);
      
      let rawData: AttendanceRecord[] = [];
      if (Array.isArray(response)) {
          rawData = response;
      } else if (response && 'data' in response && Array.isArray(response.data)) {
          rawData = response.data;
      } else {
          rawData = [];
      }

      if (rawData.length > 0) {
          const sorted = rawData.sort((a, b) => {
              const dateA = a.date ? new Date(a.date).getTime() : 0;
              const dateB = b.date ? new Date(b.date).getTime() : 0;
              return dateB - dateA;
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

  useEffect(() => {
    fetchHistory();
  }, [selectedChildId]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
         <div style={{
             background: 'var(--color-primary)', 
             padding: '12px', 
             borderRadius: '50%', 
             color: 'white',
             display: 'flex',
             boxShadow: 'var(--shadow-orange)'
         }}>
            <Users size={28} />
         </div>
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
            onSuccess={() => fetchHistory()}
            childId={selectedChildId}
        />
      )}
    </div>
  );
}