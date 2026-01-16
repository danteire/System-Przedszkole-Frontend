import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { api } from '../utils/serviceAPI';
import styles from '../commons/PaginatedTable.module.css';

// Importujemy nowy komponent
import AttendanceHistory from './AttendanceHistory';

interface Preschooler {
  id: number;
  firstName: string;
  lastName: string;
  pesel?: string;
}

interface PreschoolersListProps {
  groupId: number;
  groupName: string;
  onBack: () => void;
}

const PreschoolersList: React.FC<PreschoolersListProps> = ({ groupId, groupName, onBack }) => {
  const [kids, setKids] = useState<Preschooler[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // NOWY STAN: Przechowuje dziecko wybrane do podglądu historii
  const [selectedChildHistory, setSelectedChildHistory] = useState<Preschooler | null>(null);

  useEffect(() => {
    const fetchKids = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<Preschooler[]>(`/preschoolers/group/${groupId}`);
        if (Array.isArray(response)) {
          setKids(response);
        } else {
          setKids([]);
        }
      } catch (err: any) {
        console.error(err);
        setError("Nie udało się pobrać listy dzieci.");
      } finally {
        setLoading(false);
      }
    };

    fetchKids();
  }, [groupId]);

  if (selectedChildHistory) {
    return (
      <AttendanceHistory 
        preschoolerId={selectedChildHistory.id}
        preschoolerName={`${selectedChildHistory.firstName} ${selectedChildHistory.lastName}`}
        onBack={() => setSelectedChildHistory(null)} 
      />
    );
  }


  if (loading) return <div className={styles.wrapper}>Ładowanie listy dzieci...</div>;
  
  if (error) {
    return (
      <div className={styles.wrapper}>
        <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
        <Button variant="secondary" onClick={onBack}>Wróć do grup</Button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Grupa: {groupName}</h2>
        <Button variant="secondary" onClick={onBack}>← Wróć do Grup</Button>
      </div>

      {kids.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Brak dzieci w tej grupie.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>Imię</th>
              <th className={styles.th}>Nazwisko</th>
              <th className={styles.th}>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {kids.map((kid) => (
              <tr key={kid.id}>
                <td className={styles.td}>{kid.id}</td>
                <td className={styles.td}>{kid.firstName}</td>
                <td className={styles.td}>{kid.lastName}</td>
                <td className={styles.td}>
                  <Button 
                    variant="info" 
                    size="sm"
                    style={{ color: 'white' }}
                    onClick={() => setSelectedChildHistory(kid)}
                  >
                    📋 Historia
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PreschoolersList;