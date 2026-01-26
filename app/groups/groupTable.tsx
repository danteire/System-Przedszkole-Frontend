import React, { useState, useEffect } from 'react';
import { api } from '../utils/serviceAPI';
import styles from '../attendence/AttendanceView.module.css'; // Używamy ujednoliconego CSS
import NewGroupModal from './groupsModal';
import PreschoolersList from './PreschoolersList';
import { Users, ChevronRight, Plus, RefreshCw, User } from "lucide-react";

interface Group {
  id: number;
  groupName: string;
  mainCaretakerId: number;
}

interface Teacher {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

const GroupsTable = () => {
  const [groupsData, setGroupsData] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [groupsRes, teachersRes] = await Promise.all([
        api.get<Group[]>("/groups"),
        api.get<Teacher[]>("/accounts/teachers")
      ]);
      setGroupsData(Array.isArray(groupsRes) ? groupsRes : []);
      setTeachers(Array.isArray(teachersRes) ? teachersRes : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load groups.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (selectedGroup) {
    return (
      <PreschoolersList
        groupId={selectedGroup.id}
        groupName={selectedGroup.groupName}
        onBack={() => setSelectedGroup(null)}
      />
    );
  }

  if (loading) return <div className={styles.loading}><RefreshCw className={styles.spinner} /> Loading groups...</div>;

  if (error) {
    return (
      <div className={styles.errorBanner} style={{ margin: '20px' }}>
        {error}
        <button onClick={fetchData} className={styles.retryButton} style={{ marginLeft: '10px' }}>Retry</button>
      </div>
    );
  }

  const getCaretakerName = (id: number) => {
    const teacher = teachers.find(t => t.id === id);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : `ID: ${id}`;
  };

  // Układ kolumn: ID | Nazwa | Opiekun | Akcja
  const gridTemplate = "60px 1fr 1fr 100px";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>All Groups</h1>
          <p className={styles.date}>Manage preschool groups and students</p>
        </div>
        <button className={styles.saveButton} onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Group
        </button>
      </div>

      {groupsData.length === 0 ? (
        <div className={styles.empty}>
            <Users size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
            <span>No groups found.</span>
        </div>
      ) : (
        <div className={styles.historySection}> {/* Używamy historySection jako kontenera tabeli */}
          
          {/* HEADER ROW */}
          <div className={styles.historyHeaderRow} style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '1rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>ID</div>
            <div style={{ paddingLeft: '10px' }}>Group Name</div>
            <div>Main Caretaker</div>
            <div style={{ textAlign: 'center' }}>Action</div>
          </div>

          {/* DATA ROWS */}
          {groupsData.map((group) => (
            <div key={group.id} className={styles.historyRow} style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '1rem', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
              
              {/* ID */}
              <div className={styles.cell} style={{ justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                  #{group.id}
              </div>
              
              {/* GROUP NAME */}
              <div className={styles.cell} style={{ paddingLeft: '10px', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                  {group.groupName}
              </div>
              
              {/* CARETAKER */}
              <div className={styles.cell} style={{ color: 'var(--text-muted)' }}>
                <User size={16} style={{ marginRight: '6px' }} />
                {getCaretakerName(group.mainCaretakerId)}
              </div>
              
              {/* ACTION */}
              <div style={{ textAlign: 'center' }}>
                <button
                  className={styles.statusBtn} // Używamy klasy statusBtn dla okrągłego przycisku
                  style={{ 
                      background: 'var(--color-primary)', 
                      color: 'white', 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '50%',
                      margin: '0 auto',
                      border: 'none'
                  }}
                  onClick={() => setSelectedGroup(group)}
                  title="View Students"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewGroupModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          fetchData();
        }}
        occupiedIds={groupsData.map(group => group.mainCaretakerId)}
      />
    </div>
  );
}

export default GroupsTable;