// app/groups/AttendanceHistory.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../utils/serviceAPI';
import styles from '../attendence/AttendanceView.module.css'; // Unified styles
import { ArrowLeft, RefreshCw, Calendar, Clock, UserCheck } from "lucide-react";

export interface AttendanceDTO {
  id: number;
  date: string;
  status: string;
  arrivalTime: string | null;
  departureTime: string | null;
  preschoolerId: number;
  recordedById: number;
}

interface AttendanceHistoryProps {
  preschoolerId: number;
  preschoolerName: string;
  onBack: () => void;
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ preschoolerId, preschoolerName, onBack }) => {
  const [history, setHistory] = useState<AttendanceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<AttendanceDTO[]>(`/attendance/preschooler/${preschoolerId}`);
        if (Array.isArray(response)) {
          const sorted = response.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setHistory(sorted);
        } else {
          setHistory([]);
        }
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch history.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [preschoolerId]);

  if (loading) return <div className={styles.loading}><RefreshCw className={styles.spinner} /> Loading history...</div>;

  if (error) {
    return (
      <div className={styles.errorBanner} style={{ margin: '20px' }}>
        {error}
        <button className={styles.retryButton} onClick={onBack}>Back</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>History: {preschoolerName}</h1>
          <p className={styles.date}>Individual attendance record</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className={styles.empty}>No attendance records found for this student.</div>
      ) : (
        <div className={styles.studentsGrid}>
          <div className={styles.gridRow} style={{ gridTemplateColumns: '120px 100px 100px 100px 1fr' }}>
            <div style={{ justifyContent: 'flex-start', paddingLeft: '20px' }}>Date</div>
            <div>Status</div>
            <div>Arrival</div>
            <div>Departure</div>
            <div>Recorded By (ID)</div>
          </div>

          {history.map((record) => (
            <div key={record.id} className={styles.studentCard} style={{ gridTemplateColumns: '120px 100px 100px 100px 1fr' }}>
              <div className={`${styles.cell} ${styles.cellLeft}`} style={{ paddingLeft: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={14} color="var(--text-muted)" />
                {record.date}
              </div>
              <div className={styles.cell}>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    background:
                      record.status === 'PRESENT' ? 'var(--color-accent-green)' :
                        record.status === 'ABSENT' ? 'var(--color-accent-red)' :
                          record.status === 'LATE' ? 'var(--color-primary)' :
                            'var(--color-accent-blue)',
                    color: 'white'
                  }}
                >
                  {record.status}
                </span>
              </div>
              <div className={styles.cell}>{record.arrivalTime ? record.arrivalTime.substring(0, 5) : '-'}</div>
              <div className={styles.cell}>{record.departureTime ? record.departureTime.substring(0, 5) : '-'}</div>
              <div className={styles.cell}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>ID: {record.recordedById}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;