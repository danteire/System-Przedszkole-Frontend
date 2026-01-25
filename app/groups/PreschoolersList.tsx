// app/groups/PreschoolersList.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../utils/serviceAPI';
import styles from '../attendence/AttendanceView.module.css'; // Unified styles
import AttendanceHistory from './AttendanceHistory';
import { ArrowLeft, RefreshCw, ChevronRight, User } from "lucide-react";

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
  const [selectedChildHistory, setSelectedChildHistory] = useState<Preschooler | null>(null);

  useEffect(() => {
    const fetchKids = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<Preschooler[]>(`/preschoolers/group/${groupId}`);
        setKids(Array.isArray(response) ? response : []);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load students.");
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

  if (loading) return <div className={styles.loading}><RefreshCw className={styles.spinner} /> Loading students...</div>;

  if (error) {
    return (
      <div className={styles.errorBanner} style={{ margin: '20px' }}>
        {error}
        <button className={styles.retryButton} onClick={onBack}>Back to Groups</button>
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
          <h1 className={styles.title}>Group: {groupName}</h1>
          <p className={styles.date}>Student list</p>
        </div>
      </div>

      {kids.length === 0 ? (
        <div className={styles.empty}>No students in this group.</div>
      ) : (
        <div className={styles.studentsGrid}>
          <div className={styles.gridRow} style={{ gridTemplateColumns: '50px 1fr 1fr 120px' }}>
            <div style={{ justifyContent: 'center' }}>ID</div>
            <div style={{ justifyContent: 'flex-start' }}>First Name</div>
            <div style={{ justifyContent: 'flex-start' }}>Last Name</div>
            <div>History</div>
          </div>

          {kids.map((kid) => (
            <div key={kid.id} className={styles.studentCard} style={{ gridTemplateColumns: '50px 1fr 1fr 120px' }}>
              <div className={styles.cell} style={{ textAlign: 'center' }}>{kid.id}</div>
              <div className={`${styles.cell} ${styles.cellLeft}`}>{kid.firstName}</div>
              <div className={`${styles.cell} ${styles.cellLeft}`}>{kid.lastName}</div>
              <div className={styles.cell}>
                <button
                  className={styles.statusBtn}
                  style={{ background: 'var(--color-accent-blue)', color: 'white', width: 'auto', height: '32px', borderRadius: '20px', padding: '0 15px', fontSize: '0.8rem' }}
                  onClick={() => setSelectedChildHistory(kid)}
                >
                  History <ChevronRight size={14} style={{ marginLeft: '5px' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PreschoolersList;