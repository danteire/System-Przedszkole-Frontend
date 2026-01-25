// app/routes/attendance/components/HistoryDetailsTable.tsx
import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { ArrowLeft, RefreshCw } from "lucide-react";
import styles from "../AttendanceView.module.css";
import type { AttendanceRecord, Preschooler } from "../attendanceTypes";

interface Props {
  groupId: number;
  date: string;
  records: AttendanceRecord[]; // ZMIANA: Przyjmujemy gotowe rekordy
  onBack: () => void;
}

// Typ pomocniczy do wyświetlania
interface DisplayRecord extends AttendanceRecord {
  firstName: string;
  lastName: string;
}

export default function HistoryDetailsTable({ groupId, date, records, onBack }: Props) {
  const [displayRecords, setDisplayRecords] = useState<DisplayRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mergeData = async () => {
      try {
        // Pobieramy tylko listę dzieci, aby dopasować nazwiska
        // Jeśli masz listę dzieci w cache lub Context, możesz pominąć ten fetch
        const preschoolersRes = await api.get<Preschooler[]>(`/preschoolers/group/${groupId}`);
        const preschoolersData = Array.isArray(preschoolersRes) ? preschoolersRes : [];

        // Łączymy otrzymane w propsach 'records' z danymi dzieci
        const merged = records.map(record => {
            const child = preschoolersData.find(p => p.id === record.preschoolerId);
            return {
                ...record,
                firstName: child?.firstName || "Nieznane",
                lastName: child?.lastName || "Dziecko"
            };
        });

        // Opcjonalnie: sortowanie alfabetyczne po nazwisku
        merged.sort((a, b) => a.lastName.localeCompare(b.lastName));

        setDisplayRecords(merged);
      } catch (e) {
        console.error("Failed to fetch preschoolers details", e);
      } finally {
        setLoading(false);
      }
    };

    mergeData();
  }, [groupId, records]); // Zależność od records (które przychodzą z props)

  if (loading) return <div className={styles.loading}><RefreshCw className={styles.spinner} /> Przetwarzanie danych...</div>;

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
          {displayRecords.map((rec) => (
            <tr key={rec.id}>
              <td>{rec.firstName} {rec.lastName}</td>
              <td>
                {/* Zakładam, że masz klasy CSS np. badgePRESENT, badgeABSENT */}
                <span className={`${styles.badge} ${styles['badge' + rec.status]}`}>
                  {rec.status}
                </span>
              </td>
              <td>{rec.arrivalTime || "-"}</td>
              <td>{rec.departureTime || "-"}</td>
            </tr>
          ))}
          {displayRecords.length === 0 && (
              <tr>
                  <td colSpan={4} style={{textAlign: 'center', padding: '20px'}}>
                      Brak wpisów dla tej daty (mimo istnienia daty na liście).
                  </td>
              </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}