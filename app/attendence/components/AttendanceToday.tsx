import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { ArrowLeft, Clock, RefreshCw, Save, Calendar, Check, X, Clock as ClockIcon, FileText, LogIn, LogOut, AlertTriangle, CheckCircle } from "lucide-react";
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

  // Funkcja zmiany statusu
  const setStatus = (preschoolerId: number, status: AttendanceRecord["status"]) => {
    setAttendance(prev => {
      const newMap = new Map(prev);
      const record = newMap.get(preschoolerId);
      if (record) {
          const updates: any = { status };
          
          if ((status === "PRESENT" || status === "LATE") && !record.arrivalTime) {
              updates.arrivalTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
          }
          
          if (status === "ABSENT" || status === "EXCUSED") {
              updates.arrivalTime = null;
              updates.departureTime = null;
          }

          newMap.set(preschoolerId, { ...record, ...updates });
      }
      return newMap;
    });
  };

  // Ręczna zmiana godziny
  const handleTimeChange = (preschoolerId: number, field: 'arrivalTime' | 'departureTime', value: string) => {
    setAttendance(prev => {
        const newMap = new Map(prev);
        const record = newMap.get(preschoolerId);
        if (record) {
            newMap.set(preschoolerId, { ...record, [field]: value });
        }
        return newMap;
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSuccess(false);
    setError(null);

    // --- WALIDACJA CZASU ---
    for (const [id, record] of attendance.entries()) {
        const child = preschoolers.find(p => p.id === id);
        const name = child ? `${child.firstName} ${child.lastName}` : `ID: ${id}`;

        // 1. Sprawdź czy godzina wejścia jest podana dla statusu obecny/spóźniony
        if ((record.status === "PRESENT" || record.status === "LATE") && !record.arrivalTime) {
            setError(`Missing Arrival Time for ${name}.`);
            setSaving(false);
            return;
        }

        // 2. Sprawdź czy wyjście nie jest przed wejściem
        if (record.arrivalTime && record.departureTime) {
            const arr = record.arrivalTime.replace(':', '');
            const dep = record.departureTime.replace(':', '');
            if (parseInt(dep) <= parseInt(arr)) {
                setError(`Invalid time for ${name}: Departure cannot be before or same as Arrival.`);
                setSaving(false);
                return;
            }
        }
    }

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
      }, 3000);
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

      {/* --- KOMUNIKATY (BANERY ZAMIAST ALERTÓW) --- */}
      {error && (
          <div className={styles.errorBanner} style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
              <AlertTriangle size={20} />
              {error}
          </div>
      )}
      {success && (
          <div className={styles.successBanner} style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
              <CheckCircle size={20} />
              Attendance saved successfully!
          </div>
      )}

      <div className={styles.historySection}>
        
        {/* --- GRID HEADER --- */}
        <div className={`${styles.teacherGridLayout} ${styles.historyHeaderRow}`}>
          <div>No.</div>
          <div>First Name</div>
          <div>Last Name</div>
          <div style={{textAlign: 'center'}}>Status</div>
          <div style={{paddingLeft: '5px'}}>Time (In / Out)</div>
        </div>

        {/* --- ROWS --- */}
        {preschoolers.map((child, index) => {
          const record = attendance.get(child.id);
          if (!record) return null;

          const isPresentOrLate = record.status === "PRESENT" || record.status === "LATE";

          return (
            <div key={child.id} className={`${styles.teacherGridLayout} ${styles.historyRow}`}>
              <div className={styles.cell}>{index + 1}.</div>
              <div className={styles.cell} style={{fontWeight: 600}}>{child.firstName}</div>
              <div className={styles.cell} style={{fontWeight: 600}}>{child.lastName}</div>

              {/* Status Buttons Group */}
              <div className={styles.statusButtonGroup}>
                  <button 
                    onClick={() => setStatus(child.id, "PRESENT")}
                    className={`${styles.statusBtn} ${styles.btnPresent} ${record.status === "PRESENT" ? styles.active : ''}`}
                    title="Present"
                  >
                    <Check size={18} />
                  </button>
                  <button 
                    onClick={() => setStatus(child.id, "LATE")}
                    className={`${styles.statusBtn} ${styles.btnLate} ${record.status === "LATE" ? styles.active : ''}`}
                    title="Late"
                  >
                    <ClockIcon size={18} />
                  </button>
                  <button 
                    onClick={() => setStatus(child.id, "ABSENT")}
                    className={`${styles.statusBtn} ${styles.btnAbsent} ${record.status === "ABSENT" ? styles.active : ''}`}
                    title="Absent"
                  >
                    <X size={18} />
                  </button>
                  <button 
                    onClick={() => setStatus(child.id, "EXCUSED")}
                    className={`${styles.statusBtn} ${styles.btnExcused} ${record.status === "EXCUSED" ? styles.active : ''}`}
                    title="Excused"
                  >
                    <FileText size={18} />
                  </button>
              </div>

              {/* Time Inputs (Visible only if Present/Late) */}
              <div className={styles.timeWrapper}>
                {isPresentOrLate ? (
                    <>
                        <div className={styles.timeInputGroup} title="Arrival Time">
                            <LogIn size={14} className={styles.timeLabelIcon} />
                            <input 
                                type="time" 
                                className={styles.timeInput}
                                value={record.arrivalTime || ""}
                                onChange={(e) => handleTimeChange(child.id, 'arrivalTime', e.target.value)}
                                // Dodaję wizualne wskazanie błędu, jeśli brak czasu dla obecnego
                                style={{ 
                                    borderBottom: !record.arrivalTime ? '2px solid red' : 'none' 
                                }}
                            />
                        </div>
                        <div className={styles.timeInputGroup} title="Departure Time">
                            <LogOut size={14} className={styles.timeLabelIcon} />
                            <input 
                                type="time" 
                                className={styles.timeInput}
                                value={record.departureTime || ""}
                                onChange={(e) => handleTimeChange(child.id, 'departureTime', e.target.value)}
                            />
                        </div>
                    </>
                ) : (
                    <span style={{ fontSize: '0.85rem', color: '#cbd5e0', fontStyle: 'italic' }}>
                        -
                    </span>
                )}
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