// app/routes/attendance/components/HistoryDetailsTable.tsx
import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { ArrowLeft, RefreshCw, Clock } from "lucide-react";
import styles from "../AttendanceView.module.css";
import type { AttendanceRecord, Preschooler } from "../attendanceTypes";

interface Props {
  groupId: number;
  date: string;
  records: AttendanceRecord[];
  onBack: () => void;
}

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
        const preschoolersRes = await api.get<Preschooler[]>(`/preschoolers/group/${groupId}`);
        const preschoolersData = Array.isArray(preschoolersRes) ? preschoolersRes : [];

        const merged = records.map(record => {
          const child = preschoolersData.find(p => p.id === record.preschoolerId);
          return {
            ...record,
            firstName: child?.firstName || "Unknown",
            lastName: child?.lastName || "Child"
          };
        });

        merged.sort((a, b) => a.lastName.localeCompare(b.lastName));
        setDisplayRecords(merged);
      } catch (e) {
        console.error("Failed to fetch preschoolers details", e);
      } finally {
        setLoading(false);
      }
    };

    mergeData();
  }, [groupId, records]);

  if (loading) return <div className={styles.loading}><RefreshCw className={styles.spinner} /> Loading details...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>History: {date}</h1>
          <p className={styles.date}><Clock size={16} /> Viewing past attendance record</p>
        </div>
      </div>

      <div className={styles.studentsGrid}>
        {/* Header Row */}
        <div className={styles.gridRow} style={{ gridTemplateColumns: '1fr 1fr 150px 100px 100px' }}>
          <div style={{ justifyContent: 'flex-start', paddingLeft: '20px' }}>First Name</div>
          <div style={{ justifyContent: 'flex-start' }}>Last Name</div>
          <div>Status</div>
          <div>Arrival</div>
          <div>Departure</div>
        </div>

        {displayRecords.map((rec) => (
          <div key={rec.id} className={styles.studentCard} style={{ gridTemplateColumns: '1fr 1fr 150px 100px 100px' }}>
            <div className={`${styles.cell} ${styles.cellLeft}`} style={{ paddingLeft: '20px' }}>{rec.firstName}</div>
            <div className={`${styles.cell} ${styles.cellLeft}`}>{rec.lastName}</div>
            <div className={styles.cell}>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  background:
                    rec.status === 'PRESENT' ? 'var(--color-accent-green)' :
                      rec.status === 'ABSENT' ? 'var(--color-accent-red)' :
                        rec.status === 'LATE' ? 'var(--color-primary)' :
                          'var(--color-accent-blue)',
                  color: 'white'
                }}
              >
                {rec.status}
              </span>
            </div>
            <div className={styles.cell}>{rec.arrivalTime ? rec.arrivalTime.substring(0, 5) : "-"}</div>
            <div className={styles.cell}>{rec.departureTime ? rec.departureTime.substring(0, 5) : "-"}</div>
          </div>
        ))}

        {displayRecords.length === 0 && (
          <div className={styles.empty}>
            No records found for this date.
          </div>
        )}
      </div>
    </div>
  );
}