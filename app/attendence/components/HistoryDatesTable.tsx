// app/routes/attendance/components/HistoryDatesTable.tsx
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
          <Calendar size={48} color="#CBD5E0" />
          <p>No attendance history found for this group.</p>
        </div>
      ) : (
        <div className={styles.studentsGrid}>
          <div className={styles.gridRow} style={{ gridTemplateColumns: '1fr 1fr 100px' }}>
            <div style={{ justifyContent: 'flex-start', paddingLeft: '20px' }}>Date</div>
            <div>Records Count</div>
            <div>Action</div>
          </div>

          {uniqueDates.map((date) => {
            const count = allAttendance.filter(r => r.date === date).length;

            return (
              <div
                key={date}
                onClick={() => handleDateClick(date)}
                className={styles.studentCard}
                style={{ gridTemplateColumns: '1fr 1fr 100px', cursor: 'pointer' }}
              >
                <div className={styles.cell} style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '20px' }}>
                  <Calendar size={18} color="var(--color-primary)" />
                  <span style={{ fontWeight: 'bold' }}>{date}</span>
                </div>
                <div className={styles.cell}>{count} records</div>
                <div className={styles.cell}>
                  <button className={styles.statusBtn} style={{ background: 'var(--color-primary)', color: 'white', width: '36px', height: '36px', borderRadius: '50%' }}>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}