import React, { useState, useMemo } from "react";
import { RefreshCw, ArrowLeft } from "lucide-react"; // Usunąłem Calendar, bo jest w kalendarzu
import styles from "../AttendanceView.module.css";
import type { AttendanceRecord } from "../attendanceTypes";
import { AttendanceCalendar } from "./AttendanceCalendar";
// Zakładam, że HistoryDetailsTable jest w tym samym folderze
import HistoryDetailsTable from "./HistoryDetailsTable"; 

interface AttendanceHistoryProps {
  history: AttendanceRecord[];
  loading: boolean;
  onOpenExcuseModal: () => void; // Nauczyciel raczej tego nie używa w historii grupy, ale zachowuję interfejs
  onBack: () => void; // Dodano onBack do powrotu do "Today"
  groupId: number; // Potrzebne do szczegółów
}

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ history, loading, onOpenExcuseModal, onBack, groupId }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 1. Grupujemy rekordy po dacie, aby kalendarz wiedział, które dni mają dane
  // Dla nauczyciela: jeśli w danym dniu są jakiekolwiek rekordy -> zaznaczamy dzień.
  // Możemy stworzyć sztuczne "rekordy" dla kalendarza, gdzie status = "PRESENT" oznacza "Dane istnieją".
  const calendarData = useMemo(() => {
    const uniqueDates = new Set(history.map(r => r.date));
    const data: AttendanceRecord[] = [];
    uniqueDates.forEach(date => {
        // Tworzymy dummy record, żeby kalendarz pokazał kropkę/kolor
        // Status 'PRESENT' użyjemy jako wskaźnik "Dzień uzupełniony"
        data.push({ id: 0, date: date, status: 'PRESENT', preschoolerId: 0, arrivalTime: null, departureTime: null });
    });
    return data;
  }, [history]);

  // 2. Filtrujemy rekordy dla wybranego dnia (do szczegółów)
  const selectedDayRecords = useMemo(() => {
      if (!selectedDate) return [];
      return history.filter(r => r.date === selectedDate);
  }, [history, selectedDate]);

  if (selectedDate) {
      return (
          <HistoryDetailsTable 
              groupId={groupId}
              date={selectedDate}
              records={selectedDayRecords}
              onBack={() => setSelectedDate(null)}
          />
      );
  }

  return (
    <div className={styles.container}> {/* Używamy głównego kontenera dla spójności */}
      
      {/* HEADER */}
      <div className={styles.header}>
         <button onClick={onBack} className={styles.backButton}>
            <ArrowLeft size={20} />
         </button>
         <div className={styles.headerInfo}>
            <h1 className={styles.title}>Group History</h1>
            <p className={styles.date}>Select a day to view details</p>
         </div>
         {loading && <RefreshCw className={styles.spinner} size={20} />}
      </div>

      {/* CALENDAR */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <AttendanceCalendar 
            history={calendarData} 
            onDayClick={(record, date) => {
                // Jeśli kliknięto w dzień (nawet pusty), sprawdzamy czy są rekordy w oryginalnej historii
                // Ale logika calendarData zapewnia, że record != null tylko dla dni z historią.
                // Pozwalamy kliknąć w każdy dzień? Zazwyczaj tylko w te z danymi.
                
                const hasData = history.some(r => r.date === date);
                if (hasData) {
                    setSelectedDate(date);
                }
            }}
            // Dla nauczyciela nie pokazujemy przycisku "Report Absence" w tym widoku
            onOpenExcuseModal={() => {}} 
            // Opcjonalnie: ukryj przycisk w Calendar przez CSS lub prop (jeśli dodasz taką opcję)
          />
      </div>
      
      {/* LEGENDA / INFO */}
      <div style={{ textAlign: 'center', marginTop: '20px', color: '#718096', fontSize: '0.9rem' }}>
          Days highlighted in <span style={{ color: '#48BB78', fontWeight: 'bold' }}>Green</span> contain attendance records.
      </div>

    </div>
  );
};