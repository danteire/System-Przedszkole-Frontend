import React, { useState, useEffect } from 'react';
import { api } from '../utils/serviceAPI';
import styles from '../attendence/AttendanceView.module.css'; // Unified styles
import AttendanceHistory from './AttendanceHistory';
import AddPreschoolerModal from './AddPreschoolerModal'; // Import nowego modala
import { ArrowLeft, RefreshCw, ChevronRight, Plus, GraduationCap } from "lucide-react";

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
  
  // Stan dla widoku historii
  const [selectedChildHistory, setSelectedChildHistory] = useState<Preschooler | null>(null);
  // Stan dla modala dodawania
  const [showAddModal, setShowAddModal] = useState(false);

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

  useEffect(() => {
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

  // Grid: ID | Imię | Nazwisko | Historia
  const gridTemplate = "60px 1fr 1fr 120px";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={onBack} className={styles.backButton}>
            <ArrowLeft size={20} />
            </button>
            <div className={styles.headerInfo}>
            <h1 className={styles.title}>Group: {groupName}</h1>
            <p className={styles.date}>Preschoolers list & attendance records</p>
            </div>
        </div>

        {/* PRZYCISK DODAWANIA */}
        <button 
            className={styles.saveButton} 
            onClick={() => setShowAddModal(true)}
            style={{ padding: '10px 20px', fontSize: '0.9rem' }}
        >
          <Plus size={18} /> Add Student
        </button>
      </div>

      {kids.length === 0 ? (
        <div className={styles.empty}>
            <GraduationCap size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
            <span>No students in this group.</span>
        </div>
      ) : (
        <div className={styles.historySection}>
          
          {/* HEADER ROW */}
          <div className={styles.historyHeaderRow} style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '1rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>ID</div>
            <div style={{ paddingLeft: '10px' }}>First Name</div>
            <div>Last Name</div>
            <div style={{ textAlign: 'center' }}>History</div>
          </div>

          {/* DATA ROWS */}
          {kids.map((kid) => (
            <div key={kid.id} className={styles.historyRow} style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '1rem', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
              
              {/* ID */}
              <div className={styles.cell} style={{ justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                  {kid.id}
              </div>
              
              {/* FIRST NAME */}
              <div className={styles.cell} style={{ paddingLeft: '10px', fontWeight: 600 }}>
                  {kid.firstName}
              </div>
              
              {/* LAST NAME */}
              <div className={styles.cell} style={{ fontWeight: 600 }}>
                  {kid.lastName}
              </div>
              
              {/* ACTION BUTTON */}
              <div style={{ textAlign: 'center' }}>
                <button
                  className={styles.statusBtn} 
                  style={{ 
                      background: 'var(--bg-body)', 
                      color: 'var(--text-main)', 
                      width: 'auto', 
                      height: '32px', 
                      borderRadius: '20px', 
                      padding: '0 12px', 
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      border: '1px solid var(--color-gray-200)'
                  }}
                  onClick={() => setSelectedChildHistory(kid)}
                >
                  View <ChevronRight size={14} style={{ marginLeft: '4px' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DODAWANIA DZIECKA */}
      <AddPreschoolerModal 
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        groupId={groupId}
        groupName={groupName}
        onSuccess={() => {
            setShowAddModal(false);
            fetchKids(); // Odśwież listę po dodaniu
        }}
      />
    </div>
  );
};

export default PreschoolersList;