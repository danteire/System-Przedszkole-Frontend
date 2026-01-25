// app/routes/attendance/GroupsList.tsx
import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { Users, ChevronRight, RefreshCw } from "lucide-react";
import styles from "../GroupsList.module.css";

interface Group {
  id: number;
  groupName: string;
  mainCaretakerId: number;
}

interface GroupsListProps {
  onGroupSelect: (groupId: number) => void;
}

export default function GroupsList({ onGroupSelect }: GroupsListProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!api.isAuthenticated()) {
        throw new Error("You are not authenticated. Please log in again.");
      }

      console.log("📤 Fetching groups...");

      const response = await api.get<Group[] | { data: Group[] }>("/groups");

      let groupsData: Group[];
      if (Array.isArray(response)) {
        groupsData = response;
      } else if (response && 'data' in response && Array.isArray(response.data)) {
        groupsData = response.data;
      } else {
        groupsData = [];
      }

      console.log("✅ Groups loaded:", groupsData);
      setGroups(groupsData);
    } catch (err: any) {
      console.error("❌ Failed to load groups:", err);

      if (err.status === 401) {
        setError("Access denied. You don't have permission to view groups.");
      } else if (err.status === 403) {
        setError("Your session has expired. Redirecting to login...");
      } else {
        setError(err.message || "Failed to load groups");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <RefreshCw className={styles.spinner} size={32} />
        <p>Loading groups...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.error}>{error}</div>
        <button onClick={loadGroups} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className={styles.empty}>
        <Users size={48} className={styles.emptyIcon} />
        <p>No groups found</p>
        <button onClick={loadGroups} className={styles.refreshButton}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Select a Group</h1>
          <p className={styles.subtitle}>Choose a group to mark attendance</p>
        </div>
        <button onClick={loadGroups} className={styles.refreshButton}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className={styles.groupsGrid}>
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => onGroupSelect(group.id)}
            className={styles.groupCard}
          >
            <div className={styles.groupIcon}>
              <Users size={32} />
            </div>
            <div className={styles.groupInfo}>
              <h3 className={styles.groupName}>{group.groupName}</h3>
              <h3 className={styles.groupName}>{group.mainCaretakerId}</h3>
            </div>
            <div className={styles.arrow}>
              <ChevronRight size={24} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}