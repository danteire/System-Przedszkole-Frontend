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
    <div className={styles.historySection}>
      
      {/* HEADER SECTION */}
      <div className={styles.historyHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#ebf8ff', padding: '10px', borderRadius: '50%', color: '#3182ce' }}>
             <Calendar size={24} />
          </div>
          <div>
             <h3 className={styles.title} style={{ fontSize: '1.5rem', marginBottom: '2px' }}>
                Attendance History
             </h3>
             <span style={{ color: '#718096', fontSize: '0.9rem' }}>Record of arrivals and departures</span>
          </div>
          {loading && <RefreshCw className={styles.spinner} size={20} />}
        </div>

        <button onClick={onOpenExcuseModal} className={styles.actionBtn}>
          <CalendarX size={18} />
          Report Absence
        </button>
      </div>

      {/* GRID CONTENT */}
      {history.length === 0 && !loading ? (
        <div className={styles.empty}>
           <span>No attendance records found for this child.</span>
        </div>
      ) : (
        <div>
          {/* TABLE HEADER (GRID) */}
          <div className={`${styles.historyGridLayout} ${styles.historyHeaderRow}`}>
            <div>Date</div>
            <div style={{ textAlign: 'center' }}>Status</div>
            <div style={{ textAlign: 'center' }}>Arrival</div>
            <div style={{ textAlign: 'center' }}>Departure</div>
          </div>

          {/* TABLE ROWS (GRID) */}
          {history.map((record) => (
            <div key={record.id} className={`${styles.historyGridLayout} ${styles.historyRow}`}>
              
              {/* Date */}
              <div className={`${styles.cell} ${styles.dateText}`}>
                <Calendar size={16} color="#a0aec0" />
                {record.date ? new Date(record.date).toLocaleDateString() : '-'}
              </div>
              
              {/* Status Badge */}
              <div style={{ textAlign: 'center' }}>
                <span className={`${styles.statusBadge} ${styles['status' + record.status]}`}>
                  {record.status}
                </span>
              </div>
              
              {/* Arrival Time */}
              <div className={`${styles.cell} ${styles.mono}`} style={{ justifyContent: 'center' }}>
                {record.arrivalTime ? (
                    <>
                        <Clock size={14} color="#cbd5e0" style={{marginRight: '4px'}}/>
                        {record.arrivalTime}
                    </>
                ) : "-"}
              </div>
              
              {/* Departure Time */}
              <div className={`${styles.cell} ${styles.mono}`} style={{ justifyContent: 'center' }}>
                 {record.departureTime ? (
                    <>
                        <Clock size={14} color="#cbd5e0" style={{marginRight: '4px'}}/>
                        {record.departureTime}
                    </>
                ) : "-"}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};