// app/routes/attendance/components/AttendanceToday.tsx
import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { ArrowLeft, Clock, RefreshCw, Save, Calendar } from "lucide-react";
import styles from "../AttendanceView.module.css";
import type { AttendanceRecord, Preschooler, Group } from "../attendanceTypes";

interface Props {
  groupId: number;
  onBack: () => void;
  onHistoryClick: () => void;
}

export default function AttendanceToday({ groupId, onBack, onHistoryClick }: Props) {
  const [preschoolers, setPreschoolers] = useState<Preschooler[]>([]);
  const [attendance, setAttendance] = useState<Map<number, AttendanceRecord>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [group, setGroup] = useState<Group>();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [groupRes, preschoolersRes, todayAttendanceRes] = await Promise.all([
          api.get<Group>(`/groups/${groupId}`),
          api.get<Preschooler[]>(`/preschoolers/group/${groupId}`),
          api.get<AttendanceRecord[]>(`/attendance/date/${today}`)
        ]);

        setGroup(groupRes);
        const pData = Array.isArray(preschoolersRes) ? preschoolersRes : [];
        setPreschoolers(pData);

        const existingRecordsMap = new Map<number, AttendanceRecord>();
        if (Array.isArray(todayAttendanceRes)) {
          todayAttendanceRes.forEach(record => {
            if (pData.some(child => child.id === record.preschoolerId)) {
              existingRecordsMap.set(record.preschoolerId, record);
            }
          });
        }

        const initialAttendance = new Map<number, AttendanceRecord>();
        pData.forEach(child => {
          const existing = existingRecordsMap.get(child.id);
          if (existing) {
            initialAttendance.set(child.id, {
              ...existing,
              arrivalTime: existing.arrivalTime ? existing.arrivalTime.substring(0, 5) : null,
              departureTime: existing.departureTime ? existing.departureTime.substring(0, 5) : null,
            });
          } else {
            initialAttendance.set(child.id, {
              preschoolerId: child.id,
              status: "PRESENT",
              arrivalTime: null,
              departureTime: null,
            });
          }
        });

        setAttendance(initialAttendance);

      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [groupId, today]);

  const updateAttendance = (preschoolerId: number, field: keyof AttendanceRecord, value: any) => {
    setAttendance(prev => {
      const newMap = new Map(prev);
      const record = newMap.get(preschoolerId);
      if (record) newMap.set(preschoolerId, { ...record, [field]: value });
      return newMap;
    });
  };

  const setStatus = (preschoolerId: number, status: AttendanceRecord["status"]) => {
    updateAttendance(preschoolerId, "status", status);
    if (status === "PRESENT" || status === "LATE") {
      const record = attendance.get(preschoolerId);
      if (!record?.arrivalTime) {
        updateAttendance(preschoolerId, "arrivalTime", new Date().toTimeString().split(' ')[0].substring(0, 5));
      }
    }
  };

  const formatTimeForBackend = (time: string | undefined | null): string | null => {
    if (!time) return null;
    if (time.length === 5) return `${time}:00`;
    return time;
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const accountInfo = api.getAccountInfo();
      const attendanceData = Array.from(attendance.values());
      await Promise.all(attendanceData.map(async (record) => {
        const payload = {
          id: record.id,
          date: today,
          status: record.status,
          arrivalTime: formatTimeForBackend(record.arrivalTime),
          departureTime: formatTimeForBackend(record.departureTime),
          preschoolerId: Number(record.preschoolerId),
          recordedById: Number(accountInfo?.id)
        };
        if (record.id) {
          await api.put(`/attendance/${record.id}`, payload);
        } else {
          await api.post("/attendance", payload);
        }
      }));
      setSuccess(true);
      setTimeout(() => onBack(), 1500);
    } catch (err: any) {
      console.error("Error saving attendance:", err);
      setError("Failed to save some records. Please check connection.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}><RefreshCw className={styles.spinner} /> Loading list...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {!api.getAccountInfo()?.accountType?.includes("TEACHER") && (
            <button onClick={onBack} className={styles.backButton}>
              <ArrowLeft size={20} />
            </button>
          )}
          <button onClick={onHistoryClick} className={styles.historyButton}>
            <Calendar size={16} /> History
          </button>
        </div>

        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{group?.groupName || `Group ${groupId}`}</h1>
          <p className={styles.date}><Clock size={16} style={{ display: 'inline', marginBottom: '-2px' }} /> {today}</p>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}
      {success && <div className={styles.successBanner}>Saved successfully!</div>}

      <div className={styles.studentsGrid}>
        {/* Header Row */}
        <div className={styles.gridRow}>
          <div>No.</div>
          <div>First Name</div>
          <div>Last Name</div>
          <div>Index</div>
          <div>Present</div>
          <div>Late</div>
          <div>Absent</div>
          <div>Excused</div>
        </div>

        {/* Student Rows */}
        {preschoolers.map((child, index) => {
          const record = attendance.get(child.id);
          if (!record) return null;

          return (
            <div key={child.id} className={styles.studentCard}>
              <div className={styles.cell}>{index + 1}.</div>
              <div className={`${styles.cell} ${styles.cellLeft}`}>{child.firstName}</div>
              <div className={`${styles.cell} ${styles.cellLeft}`}>{child.lastName}</div>
              <div className={styles.cell}>{child.id}</div> {/* Assuming ID is index no for now, or add index field */}

              {/* Status Buttons */}
              {(["PRESENT", "LATE", "ABSENT", "EXCUSED"] as const).map(s => (
                <div key={s} style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    onClick={() => setStatus(child.id, s)}
                    className={`${styles.statusBtn} ${styles['status' + (s.charAt(0) + s.slice(1).toLowerCase())]} ${record.status === s ? styles.active : ""}`}
                    disabled={saving}
                    title={s}
                  >
                    {/* Content handled by CSS (checkmark) */}
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <button onClick={handleSaveAll} disabled={saving} className={styles.saveButton}>
          <Save size={18} /> {saving ? "Saving..." : "Save Attendance"}
        </button>
      </div>
    </div>
  );
}