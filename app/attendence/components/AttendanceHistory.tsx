import React from "react";
import { Calendar, Clock, RefreshCw, CalendarX } from "lucide-react";
import styles from "../AttendanceView.module.css";
import type { AttendanceRecord } from "../attendanceTypes";

interface AttendanceHistoryProps {
  history: AttendanceRecord[];
  loading: boolean;
  onOpenExcuseModal: () => void;
}

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ history, loading, onOpenExcuseModal }) => {
  return (
    <div style={{ marginTop: 'var(--spacing-2xl)', animation: 'fadeIn 0.3s ease-in' }}>
      <div className={styles.header} style={{ marginBottom: 'var(--spacing-md)', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={24} color="#4a5568" />
          <h3 className={styles.title} style={{ fontSize: 'var(--font-size-2xl)', margin: 0 }}>
            Attendance History
          </h3>
          {loading && <RefreshCw className={styles.spinner} size={20} />}
        </div>

        <button
          onClick={onOpenExcuseModal}
          className={styles.actionBtn}
          style={{
            backgroundColor: '#e53e3e', color: 'white', border: 'none',
            padding: '8px 16px', borderRadius: '6px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
          }}
        >
          <CalendarX size={18} />
          Report Absence
        </button>
      </div>

      {history.length === 0 && !loading ? (
        <div className={styles.empty} style={{ background: '#f8fafc', borderRadius: '8px' }}>
          No attendance records found for this child.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Arrival</th>
                <th>Departure</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr key={record.id} className={styles.historyRow}>
                  <td>
                    {record.date ? new Date(record.date).toLocaleDateString() : '-'}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles['badge' + record.status]}`}>
                      {record.status}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', color: '#4a5568' }}>
                    {record.arrivalTime ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={14} color="#a0aec0" /> {record.arrivalTime}
                      </div>
                    ) : "-"}
                  </td>
                  <td style={{ fontFamily: 'monospace', color: '#4a5568' }}>
                    {record.departureTime ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={14} color="#a0aec0" /> {record.departureTime}
                      </div>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};