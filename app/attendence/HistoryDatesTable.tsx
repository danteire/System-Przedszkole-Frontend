// app/routes/attendance/components/HistoryDatesTable.tsx
import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { ArrowLeft, RefreshCw } from "lucide-react";
import styles from "./AttendanceView.module.css"; 
import type { AttendanceRecord } from "./attendanceTypes";

interface Props {
  groupId: number;
  // ZMIANA: Przekazujemy też rekordy dla tej daty, żeby nie pobierać ich ponownie
  onSelectDate: (date: string, records: AttendanceRecord[]) => void; 
  onBack: () => void;
}

export default function HistoryDatesTable({ groupId, onSelectDate, onBack }: Props) {
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [uniqueDates, setUniqueDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllHistory = async () => {
      try {
        // Pobieramy WSZYSTKIE obecności dla grupy
        const response = await api.get<AttendanceRecord[]>(`/attendance/group/${groupId}`);
        const data = Array.isArray(response) ? response : [];
        
        setAllAttendance(data);

        // Wyciągamy unikalne daty i sortujemy malejąco (od najnowszej)
        const dates = Array.from(new Set(data.map(item => item.date)))
            .filter((date): date is string => date !== undefined)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
            
        setUniqueDates(dates);
      } catch (e) {
        console.error("Failed to fetch history", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAllHistory();
  }, [groupId]);

  // Handler kliknięcia w datę
  const handleDateClick = (date: string) => {
    // Filtrujemy rekordy tylko dla wybranej daty
    const recordsForDate = allAttendance.filter(r => r.date === date);
    // Przekazujemy datę ORAZ rekordy do rodzica/kolejnego komponentu
    onSelectDate(date, recordsForDate);
  };

  if (loading) return <div className={styles.loading}><RefreshCw className={styles.spinner} /> Ładowanie historii...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={16} /> Wróć do edycji dzisiejszej
        </button>
        <h2 className={styles.title}>Historia obecności - Wybierz datę</h2>
      </div>
      
      {uniqueDates.length === 0 ? (
        <p className={styles.empty}>Brak historii obecności dla tej grupy.</p>
      ) : (
        <table className={styles.historyTable}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Liczba wpisów</th>
              <th>Akcja</th>
            </tr>
          </thead>
          <tbody>
            {uniqueDates.map((date) => {
               // Obliczamy liczbę wpisów dla danej daty (opcjonalne, ale przydatne)
               const count = allAttendance.filter(r => r.date === date).length;
               
               return (
                <tr key={date} onClick={() => handleDateClick(date)} className={styles.historyRow}>
                    <td>{date}</td>
                    <td>{count}</td>
                    <td>
                    <button className={styles.detailsBtn}>Zobacz szczegóły</button>
                    </td>
                </tr>
               );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}