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
          <AlertCircle size={48} style={{ opacity: 0.3 }} />
          <span>No children linked to your account found.</span>
        </div>
      ) : (
        children.map((child) => {
          const isSelected = selectedChildId === child.id;
          
          // Pobieranie nazwy grupy
          const rawGroupId = (child as any).groupId ?? (child as any).groupID;
          let groupName = "No Group Assigned";
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
              className={`${styles.studentCard} ${isSelected ? styles.active : ''}`}
            >
              {/* AVATAR */}
              <div className={styles.avatar}>
                {child.firstName.charAt(0)}{child.lastName.charAt(0)}
              </div>

              {/* INFO */}
              <div className={styles.studentInfo}>
                <h3 className={styles.studentName}>
                  {child.firstName} {child.lastName}
                </h3>
                <span className={styles.groupName}>
                  {groupName}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};