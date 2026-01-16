// app/routes/attendance/components/AttendanceToday.tsx
import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { ArrowLeft, Check, Clock, RefreshCw, Save, X, Calendar } from "lucide-react";
import styles from "./AttendanceView.module.css";
import type { AttendanceRecord, Preschooler, Group } from "./attendanceTypes";

interface Props {
  groupId: number;
  onBack: () => void; // Powrót do listy grup
  onHistoryClick: () => void; // Przejście do historii
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
            // Równoległe pobieranie
            const [groupRes, preschoolersRes] = await Promise.all([
                api.get<Group>(`/groups/${groupId}`),
                api.get<Preschooler[]>(`/preschoolers/group/${groupId}`)
            ]);

            setGroup(groupRes);
            const pData = Array.isArray(preschoolersRes) ? preschoolersRes : [];
            setPreschoolers(pData);

            // Inicjalizacja mapy obecności
            const initialAttendance = new Map<number, AttendanceRecord>();
            pData.forEach(child => {
                initialAttendance.set(child.id, {
                preschoolerId: child.id,
                status: "PRESENT",
                arrivalTime: null,
                departureTime: null,
                });
            });
            setAttendance(initialAttendance);

        } catch (err: any) {
            setError(err.message || "Błąd ładowania danych");
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, [groupId]);

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
        updateAttendance(preschoolerId, "arrivalTime", new Date().toTimeString().split(' ')[0]);
      }
    }
  };
const formatTime = (time: string | undefined | null): string | null => {
    if (!time) return null;
    // Jeśli format to HH:mm (np. 14:30), dodaj sekundy (:00)
    if (time.length === 5) {
      return `${time}:00`;
    }
    return time; // Jeśli już jest HH:mm:ss, zostaw bez zmian
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSuccess(false);
    
    try {
        const accountInfo = api.getAccountInfo();
        console.log("🔍 [DEBUG] User Info:", accountInfo);

        // Jawne budowanie obiektu DTO
        const attendanceData = Array.from(attendance.values()).map(record => {
            const formattedArrival = formatTime(record.arrivalTime);
            const formattedDeparture = formatTime(record.departureTime);

            const payload = {
                date: today, 
                status: record.status, 
                arrivalTime: formattedArrival,  
                departureTime: formattedDeparture, 
                preschoolerId: Number(record.preschoolerId),
                recordedById: Number(accountInfo?.id)
            };

            return payload;
        });

        console.log("📦 [DEBUG] Full Payload generated (Sample 0):", attendanceData[0]);

        // Wysyłanie
        await Promise.all(attendanceData.map(async (data, index) => {
            console.log(`🚀 [DEBUG] Sending POST #${index} payload:`, JSON.stringify(data));
            
            try {
                const response = await api.post("/attendance", data);
                console.log(`✅ [DEBUG] Success POST #${index}`);
                return response;
            } catch (reqError: any) {
                console.error(`❌ [DEBUG] Failed POST #${index}. Data:`, data);
                console.error(`❌ [DEBUG] Error details:`, reqError.response?.data || reqError.message);
                throw reqError;
            }
        }));

        console.log("🏁 [DEBUG] All requests completed successfully.");
        setSuccess(true);
        setTimeout(() => onBack(), 2000);

    } catch (err: any) {
        console.error("🔥 [DEBUG] Major Error in handleSaveAll:", err);
        setError("Nie udało się zapisać obecności. Sprawdź konsolę.");
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}><RefreshCw className={styles.spinner} /> Ładowanie listy...</div>;

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onBack} className={styles.backButton}>
                <ArrowLeft size={16} /> Wróć do Grup
            </button>
            
            <button 
                onClick={onHistoryClick} 
                className={styles.historyButton} 
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '0.375rem', background: '#fff', cursor: 'pointer' }}
            >
                <Calendar size={16} /> Historia obecności grupy
            </button>
        </div>

        <div className={styles.headerInfo}>
          <h1 className={styles.title}>
            Obecność - {group?.groupName || `Grupa ${groupId}`}
          </h1>
          <p className={styles.date}>
            <Clock size={16} /> {today}
          </p>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}
      {success && <div className={styles.successBanner}>Zapisano pomyślnie!</div>}

      {/* KARTY DZIECI */}
      <div className={styles.studentsGrid}>
        {preschoolers.map((child) => {
           const record = attendance.get(child.id);
           if (!record) return null;
           return (
            <div key={child.id} className={styles.studentCard}>
                <div className={styles.studentInfo}>
                    <h3>{child.firstName} {child.lastName}</h3>
                </div>
                
                <div className={styles.statusButtons}>
                    {(["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const).map(s => (
                        <button 
                            key={s} 
                            onClick={() => setStatus(child.id, s)}
                            className={`${styles.statusBtn} ${styles['status' + (s.charAt(0) + s.slice(1).toLowerCase())]} ${record.status === s ? styles.active : ""}`}
                            disabled={saving}
                        >
                            {s}
                        </button>
                    ))}
                </div>
                
                {(record.status === "PRESENT" || record.status === "LATE") && (
                    <div className={styles.timeInputs}>
                        <div className={styles.timeInput}>
                            <label>Wejście:</label>
                            <input type="time" value={record.arrivalTime || ""} onChange={(e) => updateAttendance(child.id, "arrivalTime", e.target.value)} disabled={saving} />
                        </div>
                        <div className={styles.timeInput}>
                            <label>Wyjście:</label>
                            <input type="time" value={record.departureTime || ""} onChange={(e) => updateAttendance(child.id, "departureTime", e.target.value)} disabled={saving} />
                        </div>
                    </div>
                )}
            </div>
           );
        })}
      </div>

      <div className={styles.footer}>
        <button onClick={handleSaveAll} disabled={saving} className={styles.saveButton}>
            <Save size={16} /> Zapisz obecność
        </button>
      </div>
    </div>
  );
}