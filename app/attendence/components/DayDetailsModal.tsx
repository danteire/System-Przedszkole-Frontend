import React from 'react';
import { X, Calendar, Clock, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import styles from '../AttendanceView.module.css';
import type { AttendanceRecord } from '../attendanceTypes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  record: AttendanceRecord | null;
}

export const DayDetailsModal: React.FC<Props> = ({ isOpen, onClose, date, record }) => {
  if (!isOpen) return null;

  // Funkcja pomocnicza do kolorów i ikon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PRESENT': return { label: 'Present', color: '#48BB78', bgColor: '#F0FFF4', icon: CheckCircle };
      case 'ABSENT': return { label: 'Absent', color: '#F56565', bgColor: '#FFF5F5', icon: XCircle };
      case 'LATE': return { label: 'Late', color: '#ED8936', bgColor: '#FFFAF0', icon: Clock };
      case 'EXCUSED': return { label: 'Excused', color: '#4299E1', bgColor: '#EBF8FF', icon: FileText };
      default: return { label: 'Unknown', color: '#CBD5E0', bgColor: '#F7FAFC', icon: AlertCircle };
    }
  };

  const info = record ? getStatusInfo(record.status) : null;
  const StatusIcon = info?.icon;

  return (
    // Zdarzenie onClick na overlay zamyka modal
    <div className={styles.modalOverlay} onClick={onClose}>
      {/* Zatrzymanie propagacji, żeby kliknięcie w kartę nie zamykało modala */}
      <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            <Calendar size={20} className="text-gray-500" /> 
            {date}
          </h3>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '10px 0', textAlign: 'center' }}>
          {record && info ? (
            <>
              {/* Duża ikona statusu */}
              <div style={{ 
                width: '100px', height: '100px', borderRadius: '50%', 
                background: info.bgColor, color: info.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                border: `4px solid white`, boxShadow: '0 0 0 4px #f7fafc'
              }}>
                {StatusIcon && <StatusIcon size={48} />}
              </div>
              
              <h2 style={{ color: info.color, margin: '0 0 5px 0', fontSize: '1.8rem', fontWeight: 800 }}>
                {info.label}
              </h2>
              <p style={{ color: '#A0AEC0', fontSize: '0.9rem', margin: 0, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                Attendance Status
              </p>
              
              {/* Godziny (jeśli obecny) */}
              {(record.status === 'PRESENT' || record.status === 'LATE') && (
                <div style={{ 
                    display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '30px', 
                    paddingTop: '20px', borderTop: '2px dashed #edf2f7' 
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>Arrival</div>
                    <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#2D3748', background: '#F7FAFC', padding: '4px 12px', borderRadius: '8px' }}>
                        {record.arrivalTime?.substring(0, 5) || '--:--'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>Departure</div>
                    <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#2D3748', background: '#F7FAFC', padding: '4px 12px', borderRadius: '8px' }}>
                        {record.departureTime?.substring(0, 5) || '--:--'}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Stan braku danych
            <div style={{ color: '#718096', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '20px 0' }}>
              <div style={{ background: '#F7FAFC', padding: '20px', borderRadius: '50%' }}>
                 <AlertCircle size={48} style={{ opacity: 0.4 }} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>No Data</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>No attendance recorded for this day.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};