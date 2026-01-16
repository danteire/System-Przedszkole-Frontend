// app/routes/attendance/components/HistoryDatesTable.tsx
import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { ArrowLeft, RefreshCw } from "lucide-react";
import styles from "./AttendanceView.module.css"; 

interface Props {
  groupId: number;
  onSelectDate: (date: string) => void;
  onBack: () => void;
}

export default function HistoryDatesTable({ groupId, onSelectDate, onBack }: Props) {
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDates = async () => {
      try {
        // Dostosuj endpoint do swojego API
        const response = await api.get<string[]>(`/attendance/group/${groupId}/dates`);
        setDates(Array.isArray(response) ? response : []);
      } catch (e) {
        console.error("Failed to fetch dates", e);
        // Fallback dla testów
        // setDates(["2023-10-26", "2023-10-25"]); 
      } finally {
        setLoading(false);
      }
    };
    fetchDates();
  }, [groupId]);

  if (loading) return <div className={styles.loading}><RefreshCw className={styles.spinner} /> Ładowanie dat...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={16} /> Wróć do edycji dzisiejszej
        </button>
        <h2 className={styles.title}>Historia obecności - Wybierz datę</h2>
      </div>
      
      {dates.length === 0 ? (
        <p className={styles.empty}>Brak historii dla tej grupy.</p>
      ) : (
        <table className={styles.historyTable}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Akcja</th>
            </tr>
          </thead>
          <tbody>
            {dates.map((date) => (
              <tr key={date} onClick={() => onSelectDate(date)} className={styles.historyRow}>
                <td>{date}</td>
                <td>
                  <button className={styles.detailsBtn}>Zobacz szczegóły</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}