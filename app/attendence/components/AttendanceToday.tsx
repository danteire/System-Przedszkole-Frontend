import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { ArrowLeft, Clock, RefreshCw, Save, Calendar, Check, X, Clock as ClockIcon, FileText } from "lucide-react";
import styles from "../AttendanceView.module.css"; // Używamy tego samego pliku CSS
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

  const setStatus = (preschoolerId: number, status: AttendanceRecord["status"]) => {
    setAttendance(prev => {
      const newMap = new Map(prev);
      const record = newMap.get(preschoolerId);
      if (record) {
          const updates: any = { status };
          // Auto-fill arrival time if switching to Present/Late and it's empty
          if ((status === "PRESENT" || status === "LATE") && !record.arrivalTime) {
              updates.arrivalTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
          }
          newMap.set(preschoolerId, { ...record, ...updates });
      }
      return newMap;
    });
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
          arrivalTime: record.arrivalTime ? (record.arrivalTime.length === 5 ? `${record.arrivalTime}:00` : record.arrivalTime) : null,
          departureTime: record.departureTime ? (record.departureTime.length === 5 ? `${record.departureTime}:00` : record.departureTime) : null,
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
      setTimeout(() => {
          setSuccess(false);
          // Opcjonalnie: onBack(); 
      }, 2000);
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
          <p className={styles.date}>
              <Clock size={16} style={{ display: 'inline', marginBottom: '-2px', marginRight: '6px' }} /> 
              {today}
          </p>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}
      {success && <div className={styles.successBanner}>Attendance saved successfully!</div>}

      <div className={styles.historySection}> {/* Używamy kontenera 'historySection' dla spójności */}
        
        {/* --- GRID HEADER --- */}
        {/* Kolumny: No | Name | Last Name | Status Buttons (4 columns) */}
        <div className={`${styles.teacherGridLayout} ${styles.historyHeaderRow}`}>
          <div>No.</div>
          <div>First Name</div>
          <div>Last Name</div>
          <div style={{textAlign: 'center'}}>Present</div>
          <div style={{textAlign: 'center'}}>Late</div>
          <div style={{textAlign: 'center'}}>Absent</div>
          <div style={{textAlign: 'center'}}>Excused</div>
        </div>

        {/* --- ROWS --- */}
        {preschoolers.map((child, index) => {
          const record = attendance.get(child.id);
          if (!record) return null;

          return (
            <div key={child.id} className={`${styles.teacherGridLayout} ${styles.historyRow}`}>
              <div className={styles.cell}>{index + 1}.</div>
              <div className={styles.cell} style={{fontWeight: 600}}>{child.firstName}</div>
              <div className={styles.cell} style={{fontWeight: 600}}>{child.lastName}</div>

              {/* Status Buttons */}
              <div style={{display:'flex', justifyContent:'center'}}>
                  <button 
                    onClick={() => setStatus(child.id, "PRESENT")}
                    className={`${styles.statusBtn} ${styles.btnPresent} ${record.status === "PRESENT" ? styles.active : ''}`}
                    title="Present"
                  >
                    <Check size={16} />
                  </button>
              </div>
              <div style={{display:'flex', justifyContent:'center'}}>
                  <button 
                    onClick={() => setStatus(child.id, "LATE")}
                    className={`${styles.statusBtn} ${styles.btnLate} ${record.status === "LATE" ? styles.active : ''}`}
                    title="Late"
                  >
                    <ClockIcon size={16} />
                  </button>
              </div>
              <div style={{display:'flex', justifyContent:'center'}}>
                  <button 
                    onClick={() => setStatus(child.id, "ABSENT")}
                    className={`${styles.statusBtn} ${styles.btnAbsent} ${record.status === "ABSENT" ? styles.active : ''}`}
                    title="Absent"
                  >
                    <X size={16} />
                  </button>
              </div>
              <div style={{display:'flex', justifyContent:'center'}}>
                  <button 
                    onClick={() => setStatus(child.id, "EXCUSED")}
                    className={`${styles.statusBtn} ${styles.btnExcused} ${record.status === "EXCUSED" ? styles.active : ''}`}
                    title="Excused"
                  >
                    <FileText size={16} />
                  </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <button onClick={handleSaveAll} disabled={saving} className={styles.saveButton}>
          {saving ? <RefreshCw size={18} className={styles.spinner}/> : <Save size={18} />} 
          {saving ? " Saving..." : " Save Attendance"}
        </button>
      </div>
    </div>
  );
}