import React from "react";
import { AlertCircle } from "lucide-react";
import styles from "../AttendanceView.module.css";
import type { Preschooler } from "../attendanceTypes";

interface ChildrenListProps {
  children: Preschooler[];
  selectedChildId: number | null;
  onSelect: (id: number) => void;
  loading: boolean;
  groupsMap: Map<number, string>;
}

export const ChildrenList: React.FC<ChildrenListProps> = ({ 
  children, 
  selectedChildId, 
  onSelect, 
  loading,
  groupsMap 
}) => {
  if (loading) {
    return <div className={styles.loading}>Loading children...</div>;
  }

  return (
    <div className={styles.studentsGrid}>
      {children.length === 0 ? (
        <div className={styles.empty}>
          <AlertCircle size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
          No children linked to your account found.
        </div>
      ) : (
        children.map((child) => {
          const isSelected = selectedChildId === child.id;
          const rawGroupId = (child as any).groupId ?? (child as any).groupID;
          let groupName = "Unknown Group";
          
          if (rawGroupId !== undefined && rawGroupId !== null) {
              const numericId = Number(rawGroupId);
              if (groupsMap.has(numericId)) {
                  groupName = groupsMap.get(numericId) || "Unknown Group";
              }
          }

          return (
            <div
              key={child.id}
              onClick={() => onSelect(child.id)}
              className={styles.studentCard}
              style={{
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-gray-200)',
                backgroundColor: isSelected ? '#f0f9ff' : 'var(--bg-white)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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

                <div className={styles.studentInfo} style={{ marginBottom: 0 }}>
                  <h3 className={styles.studentName}>
                    {child.firstName} {child.lastName}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#718096' }}>
                    Group name: <strong>{groupName}</strong>
                  </span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};