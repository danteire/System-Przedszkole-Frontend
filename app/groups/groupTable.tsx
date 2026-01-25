// app/groups/groupTable.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../utils/serviceAPI';
import styles from '../attendence/AttendanceView.module.css'; // Reusing the unified grid styles
import NewGroupModal from './groupsModal';
import PreschoolersList from './PreschoolersList';
import { Users, ChevronRight, Plus, RefreshCw } from "lucide-react";

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
        <div className={styles.empty}>No groups found.</div>
      ) : (
        <div className={styles.studentsGrid}>
          <div className={styles.gridRow} style={{ gridTemplateColumns: '50px 1fr 1fr 100px' }}>
            <div style={{ justifyContent: 'center' }}>ID</div>
            <div style={{ justifyContent: 'flex-start' }}>Group Name</div>
            <div style={{ justifyContent: 'flex-start' }}>Main Caretaker</div>
            <div>Action</div>
          </div>

          {groupsData.map((group) => (
            <div key={group.id} className={styles.studentCard} style={{ gridTemplateColumns: '50px 1fr 1fr 100px' }}>
              <div className={styles.cell} style={{ textAlign: 'center' }}>{group.id}</div>
              <div className={`${styles.cell} ${styles.cellLeft}`} style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{group.groupName}</div>
              <div className={`${styles.cell} ${styles.cellLeft}`} style={{ color: 'var(--text-muted)' }}>
                <Users size={16} style={{ display: 'inline', marginRight: '5px' }} />
                {getCaretakerName(group.mainCaretakerId)}
              </div>
              <div className={styles.cell}>
                <button
                  className={styles.statusBtn}
                  style={{ background: 'var(--color-primary)', color: 'white', width: '36px', height: '36px', borderRadius: '50%' }}
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