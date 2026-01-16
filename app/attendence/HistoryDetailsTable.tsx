// app/routes/attendance/components/HistoryDetailsTable.tsx
import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { ArrowLeft, RefreshCw } from "lucide-react";
import styles from "./AttendanceView.module.css";
import type { AttendanceRecord, Preschooler } from "./attendanceTypes";

interface Props {
  groupId: number;
  date: string;
  onBack: () => void;
}

export default function HistoryDetailsTable({ groupId, date, onBack }: Props) {
  const [records, setRecords] = useState<(AttendanceRecord & { firstName: string, lastName: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // 1. Pobieramy rekordy obecności
        const attendanceRes = await api.get<AttendanceRecord[]>(`/attendance/group/${groupId}?date=${date}`);
        // 2. Pobieramy listę dzieci (dla nazwisk)
        const preschoolersRes = await api.get<Preschooler[]>(`/preschoolers/group/${groupId}`);
        
        const attendanceData = Array.isArray(attendanceRes) ? attendanceRes : [];
        const preschoolersData = Array.isArray(preschoolersRes) ? preschoolersRes : [];

        const merged = attendanceData.map(record => {
            const child = preschoolersData.find(p => p.id === record.preschoolerId);
            return {
                ...record,
                firstName: child?.firstName || "Nieznane",
                lastName: child?.lastName || "Dziecko"
            };
        });

        setRecords(merged);
      } catch (e) {
        console.error("Failed to fetch history details", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [groupId, date]);

  if (loading) return <div className={styles.loading}><RefreshCw className={styles.spinner} /> Ładowanie szczegółów...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={16} /> Wróć do listy dat
        </button>
        <h2 className={styles.title}>Obecność z dnia: {date}</h2>
      </div>

      <table className={styles.historyTable}>
        <thead>
          <tr>
            <th>Imię i Nazwisko</th>
            <th>Status</th>
            <th>Wejście</th>
            <th>Wyjście</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => (
            <tr key={rec.id || rec.preschoolerId}>
              <td>{rec.firstName} {rec.lastName}</td>
              <td>
                <span className={`${styles.badge} ${styles['badge' + rec.status]}`}>
                  {rec.status}
                </span>
              </td>
              <td>{rec.arrivalTime || "-"}</td>
              <td>{rec.departureTime || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}