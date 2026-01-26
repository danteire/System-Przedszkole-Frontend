import React, { useState, useEffect } from 'react';
import { api } from '../utils/serviceAPI';
import styles from '../attendence/AttendanceView.module.css'; // Ujednolicony CSS
import { ArrowLeft, RefreshCw, Calendar, UserCheck, Clock } from "lucide-react";

export interface AttendanceDTO {
  id: number;
  date: string;
  status: string;
  arrivalTime: string | null;
  departureTime: string | null;
  preschoolerId: number;
  recordedById: number;
}

interface AccountSimple {
    id: number;
    firstName: string;
    lastName: string;
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
  
  const [userMap, setUserMap] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const historyResponse = await api.get<AttendanceDTO[]>(`/attendance/preschooler/${preschoolerId}`);
        
        if (Array.isArray(historyResponse)) {
            const historyData = historyResponse.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setHistory(historyData);
        } else {
            setHistory([]);
        }

        try {
            const accountsResponse = await api.get<AccountSimple[]>("/accounts");
            if (Array.isArray(accountsResponse)) {
                const map: Record<number, string> = {};
                accountsResponse.forEach(acc => {
                    map[acc.id] = `${acc.firstName} ${acc.lastName}`;
                });
                setUserMap(map);
            }
        } catch (accountError) {
            console.warn("Could not fetch accounts map:", accountError);
        }

      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch history.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [preschoolerId]);

  if (loading) return <div className={styles.loading}><RefreshCw className={styles.spinner} /> Loading history...</div>;

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorBanner}>{error}</div>
        <button className={styles.retryButton} onClick={onBack}>Back</button>
      </div>
    );
  }

  // Definicja układu kolumn: Data | Status | Wejście | Wyjście | Zapisane przez
  const gridTemplate = "140px 120px 100px 100px 1fr";

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
        <div className={styles.empty}>
            <Calendar size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
            <span>No attendance records found for this student.</span>
        </div>
      ) : (
        <div className={styles.historySection}> {/* Kontener "białej karty" */}
          
          {/* HEADER ROW */}
          <div 
            className={styles.historyHeaderRow} 
            style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '1rem', alignItems: 'center' }}
          >
            <div style={{ paddingLeft: '10px' }}>Date</div>
            <div style={{ textAlign: 'center' }}>Status</div>
            <div style={{ textAlign: 'center' }}>Arrival</div>
            <div style={{ textAlign: 'center' }}>Departure</div>
            <div>Recorded By</div> 
          </div>

          {/* DATA ROWS */}
          {history.map((record) => (
            <div 
                key={record.id} 
                className={styles.historyRow} 
                style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '1rem', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}
            >
              
              {/* DATE CELL */}
              <div className={`${styles.cell} ${styles.dateText}`} style={{ paddingLeft: '10px' }}>
                <Calendar size={16} color="var(--text-muted)" />
                {record.date}
              </div>
              
              {/* STATUS CELL */}
              <div style={{ textAlign: 'center' }}>
                <span className={`${styles.statusBadge} ${styles['status' + record.status]}`}>
                  {record.status}
                </span>
              </div>
              
              {/* ARRIVAL */}
              <div className={`${styles.cell} ${styles.mono}`} style={{ justifyContent: 'center' }}>
                {record.arrivalTime ? record.arrivalTime.substring(0, 5) : '-'}
              </div>

              {/* DEPARTURE */}
              <div className={`${styles.cell} ${styles.mono}`} style={{ justifyContent: 'center' }}>
                {record.departureTime ? record.departureTime.substring(0, 5) : '-'}
              </div>
              
              {/* RECORDED BY CELL */}
              <div className={styles.cell} style={{ color: 'var(--text-muted)' }}>
                 <UserCheck size={16} style={{ marginRight: '6px' }}/>
                 {userMap[record.recordedById] || `ID: ${record.recordedById}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;