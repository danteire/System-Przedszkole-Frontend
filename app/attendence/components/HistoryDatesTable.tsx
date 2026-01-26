import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { ArrowLeft, RefreshCw, Calendar, ChevronRight } from "lucide-react";
import styles from "../AttendanceView.module.css";
import type { AttendanceRecord } from "../attendanceTypes";

interface Props {
  groupId: number;
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
        const response = await api.get<AttendanceRecord[]>(`/attendance/group/${groupId}`);
        const data = Array.isArray(response) ? response : [];
        setAllAttendance(data);

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

  const handleDateClick = (date: string) => {
    const recordsForDate = allAttendance.filter(r => r.date === date);
    onSelectDate(date, recordsForDate);
  };

  if (loading) return <div className={styles.loading}><RefreshCw className={styles.spinner} /> Loading history...</div>;

  // Układ kolumn dla tej tabeli: Data | Liczba rekordów | Akcja
  // Definiujemy grid inline lub w CSS, tutaj inline dla uproszczenia specyficznego widoku
  const gridTemplate = "1fr 1fr 80px";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>Attendance History</h1>
          <p className={styles.date}>Select a date to view records</p>
        </div>
      </div>

      {uniqueDates.length === 0 ? (
        <div className={styles.empty}>
          <Calendar size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
          <span>No attendance history found for this group.</span>
        </div>
      ) : (
        <div className={styles.historySection}>
          
          {/* HEADER ROW */}
          <div className={`${styles.historyHeaderRow}`} style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '1rem', alignItems: 'center' }}>
            <div style={{ paddingLeft: '20px' }}>Date</div>
            <div>Records Count</div>
            <div style={{ textAlign: 'center' }}>Action</div>
          </div>

          {/* DATA ROWS */}
          {uniqueDates.map((date) => {
            const count = allAttendance.filter(r => r.date === date).length;

            return (
              <div
                key={date}
                onClick={() => handleDateClick(date)}
                className={styles.historyRow}
                style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '1rem', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
              >
                {/* DATE */}
                <div className={`${styles.cell} ${styles.dateText}`} style={{ paddingLeft: '20px' }}>
                  <Calendar size={18} className={styles.iconMuted} />
                  {date}
                </div>
                
                {/* COUNT */}
                <div className={styles.cell}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{count}</span> 
                    <span style={{ color: 'var(--text-muted)', marginLeft: '4px', fontSize: '0.9rem' }}>records</span>
                </div>
                
                {/* ACTION BUTTON */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                      background: 'var(--bg-body)', 
                      color: 'var(--text-muted)', 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      margin: '0 auto'
                  }}>
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}