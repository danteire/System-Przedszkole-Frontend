// app/routes/attendance/AttendanceView.tsx
import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import styles from "./AttendanceView.module.css";
import { ArrowLeft, Check, Clock, RefreshCw, Save, X } from "lucide-react";

interface Preschooler {
  id: number;
  firstName: string;
  lastName: string;
  groupID: number;
}

interface AttendanceRecord {
  preschoolerId: number;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  arrivalTime: string | null;
  departureTime: string | null;
}

interface Group {
  id: number;
  groupName: string;
  mainCaretakerId: number;
}

interface AttendanceViewProps {
  groupId: number;
  onBack: () => void;
}

export default function AttendanceView({ groupId, onBack }: AttendanceViewProps) {
  const [preschoolers, setPreschoolers] = useState<Preschooler[]>([]);
  const [attendance, setAttendance] = useState<Map<number, AttendanceRecord>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [group, setGroup] = useState<Group>();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadPreschoolers();
    loadGroupInfo();
  }, [groupId]);

  const loadGroupInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<Group>(`/groups/${groupId}`);
      console.log("✅ Groups fetched:", response);
      let groupData: Group = response;
      
                setGroup(groupData);

    } catch (err: any) {
            console.error("❌ Failed to load groups:", err);
      
            // 401 = Unauthorized - brak dostępu
            if (err.status === 401) {
              setError("Access denied. You don't have permission to view groups.");
            } 
            // Inne błędy
            else {
              setError(err.message || "Failed to load groups");
            }
    } finally {
        setLoading(false);
    }
    
  };

  const loadPreschoolers = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`📤 Fetching preschoolers for group ${groupId}...`);

      // Pobierz przedszkolaków dla grupy
      const response = await api.get<Preschooler[] | { data: Preschooler[] }>(
        `/preschoolers/group/${groupId}`
      );

      let preschoolersData: Preschooler[];
      if (Array.isArray(response)) {
        preschoolersData = response;
      } else if (response && 'data' in response) {
        preschoolersData = response.data;
      } else {
        preschoolersData = [];
      }

      console.log("✅ Preschoolers loaded:", preschoolersData);
      setPreschoolers(preschoolersData);

      // Inicjalizuj stan obecności dla każdego dziecka
      const initialAttendance = new Map<number, AttendanceRecord>();
      preschoolersData.forEach(child => {
        initialAttendance.set(child.id, {
          preschoolerId: child.id,
          status: "PRESENT",
          arrivalTime: null,
          departureTime: null,
        });
      });
      setAttendance(initialAttendance);

    } catch (err: any) {
      console.error("❌ Failed to load preschoolers:", err);
      setError(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = (
    preschoolerId: number,
    field: keyof AttendanceRecord,
    value: any
  ) => {
    setAttendance(prev => {
      const newMap = new Map(prev);
      const record = newMap.get(preschoolerId);
      if (record) {
        newMap.set(preschoolerId, {
          ...record,
          [field]: value,
        });
      }
      return newMap;
    });
    if (success) setSuccess(false);
  };

  const setStatus = (preschoolerId: number, status: AttendanceRecord["status"]) => {
    updateAttendance(preschoolerId, "status", status);
    
    // Jeśli ustawiono PRESENT i nie ma czasu przyjścia, ustaw aktualny czas
    if (status === "PRESENT" || status === "LATE") {
      const record = attendance.get(preschoolerId);
      if (!record?.arrivalTime) {
        const now = new Date().toTimeString().split(' ')[0];
        updateAttendance(preschoolerId, "arrivalTime", now);
      }
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Pobierz ID zalogowanego użytkownika
      const accountInfo = api.getAccountInfo();
      if (!accountInfo) {
        throw new Error("Cannot determine user ID");
      }

      const recordedById = accountInfo.id;

      // Przygotuj dane do wysłania (zgodne z DTO)
      const attendanceData = Array.from(attendance.values()).map(record => ({
        date: today,
        status: record.status,
        arrivalTime: record.arrivalTime,
        departureTime: record.departureTime,
        preschoolerId: record.preschoolerId,
        recordedById: recordedById,
      }));

      console.log("📤 Saving attendance:", attendanceData);

      // Wyślij każdy rekord osobno (lub batch jeśli backend wspiera)
      const promises = attendanceData.map(data =>
        api.post("/attendance", data)
      );

      await Promise.all(promises);

      console.log("✅ Attendance saved successfully");
      setSuccess(true);

      // Opcjonalnie: wróć do listy grup po 2 sekundach
      setTimeout(() => {
        onBack();
      }, 2000);

    } catch (err: any) {
      console.error("❌ Failed to save attendance:", err);

      if (err.status === 401) {
        setError("Access denied. You don't have permission to save attendance.");
      } else if (err.status === 403) {
        setError("Your session has expired. Redirecting to login...");
      } else {
        setError(err.message || "Failed to save attendance");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <RefreshCw className={styles.spinner} size={32} />
        <p>Loading students...</p>
      </div>
    );
  }

  if (error && preschoolers.length === 0) {
    return (
      <div className={styles.errorContainer}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={16} />
          Back to Groups
        </button>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={16} />
          Back to Groups
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>
            Attendance - {group?.groupName || `Group ${group?.id}`}
          </h1>
          <p className={styles.date}>
            <Clock size={16} />
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>{error}</div>
      )}

      {success && (
        <div className={styles.successBanner}>
          ✅ Attendance saved successfully! Returning to groups...
        </div>
      )}

      {preschoolers.length === 0 ? (
        <div className={styles.empty}>
          <p>No students in this group</p>
        </div>
      ) : (
        <>
          <div className={styles.studentsGrid}>
            {preschoolers.map((child) => {
              const record = attendance.get(child.id);
              if (!record) return null;

              return (
                <div key={child.id} className={styles.studentCard}>
                  <div className={styles.studentInfo}>
                    <h3 className={styles.studentName}>
                      {child.firstName} {child.lastName}
                    </h3>
                  </div>

                  <div className={styles.statusButtons}>
                    <button
                      onClick={() => setStatus(child.id, "PRESENT")}
                      className={`${styles.statusBtn} ${styles.statusPresent} ${
                        record.status === "PRESENT" ? styles.active : ""
                      }`}
                      disabled={saving}
                    >
                      <Check size={16} />
                      Present
                    </button>
                    <button
                      onClick={() => setStatus(child.id, "ABSENT")}
                      className={`${styles.statusBtn} ${styles.statusAbsent} ${
                        record.status === "ABSENT" ? styles.active : ""
                      }`}
                      disabled={saving}
                    >
                      <X size={16} />
                      Absent
                    </button>
                    <button
                      onClick={() => setStatus(child.id, "LATE")}
                      className={`${styles.statusBtn} ${styles.statusLate} ${
                        record.status === "LATE" ? styles.active : ""
                      }`}
                      disabled={saving}
                    >
                      <Clock size={16} />
                      Late
                    </button>
                    <button
                      onClick={() => setStatus(child.id, "EXCUSED")}
                      className={`${styles.statusBtn} ${styles.statusExcused} ${
                        record.status === "EXCUSED" ? styles.active : ""
                      }`}
                      disabled={saving}
                    >
                      Excused
                    </button>
                  </div>

                  {(record.status === "PRESENT" || record.status === "LATE") && (
                    <div className={styles.timeInputs}>
                      <div className={styles.timeInput}>
                        <label>Arrival Time:</label>
                        <input
                          type="time"
                          value={record.arrivalTime || ""}
                          onChange={(e) =>
                            updateAttendance(child.id, "arrivalTime", e.target.value)
                          }
                          disabled={saving}
                        />
                      </div>
                      <div className={styles.timeInput}>
                        <label>Departure Time:</label>
                        <input
                          type="time"
                          value={record.departureTime || ""}
                          onChange={(e) =>
                            updateAttendance(child.id, "departureTime", e.target.value)
                          }
                          disabled={saving}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.footer}>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className={styles.saveButton}
            >
              {saving ? (
                <>
                  <RefreshCw className={styles.spinner} size={16} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save All Attendance
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}