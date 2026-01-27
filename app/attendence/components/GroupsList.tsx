import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { Users, ChevronRight, RefreshCw, User } from "lucide-react";
import styles from "../GroupsList.module.css";

interface Group {
  id: number;
  groupName: string;
  mainCaretakerId: number;
}

// 1. Dodajemy interfejs dla Nauczyciela
interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
}

interface GroupsListProps {
  onGroupSelect: (groupId: number) => void;
}

export default function GroupsList({ onGroupSelect }: GroupsListProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  // 2. Stan do przechowywania mapy ID -> Imię Nazwisko
  const [caretakerMap, setCaretakerMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!api.isAuthenticated()) {
        throw new Error("You are not authenticated. Please log in again.");
      }

      console.log("📤 Fetching groups and caretakers...");

      // 3. Pobieramy równolegle grupy i listę nauczycieli
      const [groupsRes, teachersRes] = await Promise.all([
        api.get<Group[] | { data: Group[] }>("/groups"),
        api.get<Teacher[]>("/accounts/teachers")
      ]);

      // --- Obsługa danych grup ---
      let groupsData: Group[];
      if (Array.isArray(groupsRes)) {
        groupsData = groupsRes;
      } else if (groupsRes && 'data' in groupsRes && Array.isArray((groupsRes as any).data)) {
        groupsData = (groupsRes as any).data;
      } else {
        groupsData = [];
      }

      // --- Obsługa danych nauczycieli i tworzenie mapy ---
      const teachersData = Array.isArray(teachersRes) ? teachersRes : [];
      const newCaretakerMap = new Map<number, string>();
      
      teachersData.forEach(t => {
        newCaretakerMap.set(t.id, `${t.firstName} ${t.lastName}`);
      });

      console.log("✅ Data loaded:", { groups: groupsData.length, caretakers: newCaretakerMap.size });
      
      setGroups(groupsData);
      setCaretakerMap(newCaretakerMap);

    } catch (err: any) {
      console.error("❌ Failed to load data:", err);

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
        <button onClick={loadData} className={styles.retryButton}>
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
        <button onClick={loadData} className={styles.refreshButton}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>Select a Group</h1>
          <p className={styles.subtitle}>Choose a group to mark attendance</p>
        </div>
        <button onClick={loadData} className={styles.refreshButton}>
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
            {/* Ikona Grupy */}
            <div className={styles.iconWrapper}>
              <Users size={28} />
            </div>
            
            {/* Informacje o Grupie */}
            <div className={styles.groupInfo}>
              <h3 className={styles.groupName}>{group.groupName}</h3>
              <div className={styles.caretakerInfo}>
                 <User size={14} /> 
                 {/* 4. Wyświetlanie imienia i nazwiska z mapy */}
                 <span>
                    {caretakerMap.get(group.mainCaretakerId) || `Caretaker Unassigned`}
                 </span>
              </div>
            </div>
            
            {/* Strzałka */}
            <div className={styles.arrow}>
              <ChevronRight size={24} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}