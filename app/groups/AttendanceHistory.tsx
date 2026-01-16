import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { api } from '../utils/serviceAPI';
import styles from '../commons/PaginatedTable.module.css';

// Odzwierciedlenie Twojego Java DTO w TypeScript
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
        setError("Nie udało się pobrać historii obecności.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [preschoolerId]);

  if (loading) return <div className={styles.wrapper}>Ładowanie historii...</div>;
  if (error) {
    return (
      <div className={styles.wrapper}>
        <div style={{ color: 'red' }}>{error}</div>
        <Button variant="secondary" onClick={onBack}>Wróć</Button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Historia: {preschoolerName}</h3>
        <Button variant="secondary" onClick={onBack}>← Wróć do listy dzieci</Button>
      </div>

      {history.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Brak wpisów obecności dla tego dziecka.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Data</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Wejście</th>
              <th className={styles.th}>Wyjście</th>
              <th className={styles.th}>ID Rejestrującego</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record) => (
              <tr key={record.id}>
                <td className={styles.td}>{record.date}</td>
                <td className={styles.td}>
                    {/* Tutaj możesz dodać proste mapowanie kolorów/tłumaczeń dla statusów */}
                    <span style={{ fontWeight: 'bold', color: record.status === 'PRESENT' ? 'green' : 'red' }}>
                        {record.status}
                    </span>
                </td>
                <td className={styles.td}>{record.arrivalTime || '-'}</td>
                <td className={styles.td}>{record.departureTime || '-'}</td>
                <td className={styles.td}>{record.recordedById}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AttendanceHistory;