import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { RefreshCw, User, Calendar, Clock, AlertCircle } from "lucide-react";
import styles from "./AttendanceView.module.css";
import type { Preschooler, AttendanceRecord } from "./attendanceTypes";

export default function ParentAttendanceView() {
  const [children, setChildren] = useState<Preschooler[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 1. Fetch parent's children
  useEffect(() => {
    const fetchChildren = async () => {
      setLoadingChildren(true);
      try {
        const accountInfo = api.getAccountInfo();
        if (accountInfo?.id) {
          const data = await api.get<Preschooler[]>(`/preschoolers/parent/${accountInfo.id}`);
          setChildren(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch children:", error);
      } finally {
        setLoadingChildren(false);
      }
    };
    fetchChildren();
  }, []);

  // 2. Fetch history when a child is selected
  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedChildId) return;
      
      setLoadingHistory(true);
      setAttendanceHistory([]); 
      
      try {
        const data = await api.get<AttendanceRecord[]>(`/attendance/preschooler/${selectedChildId}`);
        
        if (Array.isArray(data)) {
            const sorted = data.sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                return dateB - dateA;
            });
            setAttendanceHistory(sorted);
        }
      } catch (error) {
        console.error("Failed to fetch attendance history:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [selectedChildId]);

  if (loadingChildren) {
    return (
        <div className={styles.loading}>
            <RefreshCw className={styles.spinner} /> Loading your children...
        </div>
    );
  }

  return (
    <div className={styles.container}>
      
      {/* HEADER */}
      <div className={styles.header}>
         <User size={32} color="#4a5568" />
         <h2 className={styles.title}>My Children</h2>
      </div>

      {/* CHILDREN LIST (CARDS) */}
      <div className={styles.studentsGrid}>
        {children.length === 0 ? (
           <div className={styles.empty}>
               <AlertCircle size={32} style={{margin: '0 auto 10px', opacity: 0.5}}/>
               No children linked to your account found.
           </div>
        ) : (
          children.map((child) => {
            const isSelected = selectedChildId === child.id;
            return (
                <div
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={styles.studentCard}
                style={{
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-gray-200)',
                    backgroundColor: isSelected ? '#f0f9ff' : 'var(--bg-white)'
                }}
                >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {/* Avatar Style Inline - bo nie ma w CSS */}
                    <div style={{
                        width: '50px', height: '50px', 
                        borderRadius: '50%', 
                        background: isSelected ? 'var(--color-primary)' : '#e2e8f0',
                        color: isSelected ? '#fff' : '#4a5568',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', fontSize: '1.2rem'
                    }}>
                        {child.firstName.charAt(0)}{child.lastName.charAt(0)}
                    </div>
                    
                    <div className={styles.studentInfo} style={{marginBottom: 0}}>
                        <h3 className={styles.studentName}>
                            {child.firstName} {child.lastName}
                        </h3>
                        <span style={{ fontSize: '0.85rem', color: '#718096' }}>
                            Group ID: {child.groupID}
                        </span>
                    </div>
                </div>
                </div>
            );
          })
        )}
      </div>

      {/* HISTORY SECTION */}
      {selectedChildId && (
        <div style={{ marginTop: 'var(--spacing-2xl)', animation: 'fadeIn 0.3s ease-in' }}>
          <div className={styles.header} style={{ marginBottom: 'var(--spacing-md)' }}>
              <Calendar size={24} color="#4a5568"/>
              <h3 className={styles.title} style={{ fontSize: 'var(--font-size-2xl)' }}>
                  Attendance History
              </h3>
              {loadingHistory && <RefreshCw className={styles.spinner} size={20} />}
          </div>

          {attendanceHistory.length === 0 && !loadingHistory ? (
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
                  {attendanceHistory.map((record) => (
                    <tr key={record.id} className={styles.historyRow}>
                      <td>
                        {record.date ? new Date(record.date).toLocaleDateString() : '-'}
                      </td>
                      <td>
                        {/* Użycie klas badge z CSS */}
                        <span className={`${styles.badge} ${styles['badge' + record.status]}`}>
                          {record.status}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: '#4a5568' }}>
                        {record.arrivalTime ? (
                            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                <Clock size={14} color="#a0aec0"/> {record.arrivalTime}
                            </div>
                        ) : "-"}
                      </td>
                      <td style={{ fontFamily: 'monospace', color: '#4a5568' }}>
                         {record.departureTime ? (
                            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                <Clock size={14} color="#a0aec0"/> {record.departureTime}
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
      )}
    </div>
  );
}