import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { ArrowLeft, RefreshCw, Clock, User, Calendar } from "lucide-react";
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

  // Układ kolumn: Imię | Nazwisko | Status | Wejście | Wyjście
  const gridTemplate = "1fr 1fr 120px 100px 100px";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>History: {date}</h1>
          <p className={styles.date}>
              <Clock size={16} style={{ display: 'inline', marginBottom: '-2px', marginRight: '6px' }} /> 
              Viewing past attendance record
          </p>
        </div>
      </div>

      <div className={styles.historySection}>
        
        {/* HEADER ROW */}
        <div className={styles.historyHeaderRow} style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '1rem', alignItems: 'center' }}>
          <div style={{ paddingLeft: '20px' }}>First Name</div>
          <div>Last Name</div>
          <div style={{ textAlign: 'center' }}>Status</div>
          <div style={{ textAlign: 'center' }}>Arrival</div>
          <div style={{ textAlign: 'center' }}>Departure</div>
        </div>

        {/* DATA ROWS */}
        {displayRecords.map((rec) => (
          <div key={rec.id} className={styles.historyRow} style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '1rem', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
            
            <div className={styles.cell} style={{ paddingLeft: '20px', fontWeight: 600 }}>
                {rec.firstName}
            </div>
            
            <div className={styles.cell} style={{ fontWeight: 600 }}>
                {rec.lastName}
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <span className={`${styles.statusBadge} ${styles['status' + rec.status]}`}>
                {rec.status}
              </span>
            </div>
            
            <div className={`${styles.cell} ${styles.fontMono}`} style={{ justifyContent: 'center' }}>
                {rec.arrivalTime ? rec.arrivalTime.substring(0, 5) : "-"}
            </div>
            
            <div className={`${styles.cell} ${styles.fontMono}`} style={{ justifyContent: 'center' }}>
                {rec.departureTime ? rec.departureTime.substring(0, 5) : "-"}
            </div>
          </div>
        ))}

        {displayRecords.length === 0 && (
          <div className={styles.empty} style={{ padding: '2rem' }}>
            <span>No records found for this date.</span>
          </div>
        )}
      </div>
    </div>
  );
}