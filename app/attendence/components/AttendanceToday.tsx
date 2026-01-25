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

  // YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Pobieramy równolegle: Dane grupy, Listę dzieci, Obecności z dzisiaj
            // Używamy endpointu getByDate, a potem przefiltrujemy po ID dzieci z tej grupy
            const [groupRes, preschoolersRes, todayAttendanceRes] = await Promise.all([
                api.get<Group>(`/groups/${groupId}`),
                api.get<Preschooler[]>(`/preschoolers/group/${groupId}`),
                api.get<AttendanceRecord[]>(`/attendance/date/${today}`)
            ]);

            setGroup(groupRes);
            const pData = Array.isArray(preschoolersRes) ? preschoolersRes : [];
            setPreschoolers(pData);

            // 2. Przygotowujemy mapę istniejących rekordów dla łatwego dostępu
            // Filtrujemy todayAttendanceRes, aby mieć pewność, że to rekordy dzieci z naszej grupy
            // (zakładając, że endpoint /attendance/date/{date} zwraca wszystkich w przedszkolu)
            const existingRecordsMap = new Map<number, AttendanceRecord>();
            
            if (Array.isArray(todayAttendanceRes)) {
                todayAttendanceRes.forEach(record => {
                    // Sprawdzamy, czy ten rekord dotyczy dziecka z aktualnej listy pData
                    if (pData.some(child => child.id === record.preschoolerId)) {
                        existingRecordsMap.set(record.preschoolerId, record);
                    }
                });
            }

            // 3. Budujemy stan formularza
            const initialAttendance = new Map<number, AttendanceRecord>();
            
            pData.forEach(child => {
                const existing = existingRecordsMap.get(child.id);

                if (existing) {
                    // --- SCENARIUSZ EDYCJI ---
                    // Mamy rekord z bazy (ma ID), używamy jego danych
                    initialAttendance.set(child.id, {
                        ...existing,
                        // Input type="time" potrzebuje formatu HH:mm. Backend może zwracać HH:mm:ss
                        arrivalTime: existing.arrivalTime ? existing.arrivalTime.substring(0, 5) : null,
                        departureTime: existing.departureTime ? existing.departureTime.substring(0, 5) : null,
                    });
                } else {
                    // --- SCENARIUSZ TWORZENIA ---
                    // Brak rekordu, ustawiamy domyślne "PRESENT"
                    initialAttendance.set(child.id, {
                        preschoolerId: child.id,
                        status: "PRESENT",
                        arrivalTime: null,
                        departureTime: null,
                        // Ważne: brak pola 'id' oznacza, że to nowy rekord
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
    // Automatyczne ustawianie czasu przyjścia przy zmianie na Obecny/Spóźniony (tylko jeśli puste)
    if (status === "PRESENT" || status === "LATE") {
      const record = attendance.get(preschoolerId);
      if (!record?.arrivalTime) {
        updateAttendance(preschoolerId, "arrivalTime", new Date().toTimeString().split(' ')[0].substring(0, 5));
      }
    }
  };

  // Helper do formatowania czasu dla backendu (dodaje sekundy jeśli trzeba)
  const formatTimeForBackend = (time: string | undefined | null): string | null => {
    if (!time) return null;
    if (time.length === 5) {
      return `${time}:00`;
    }
    return time;
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSuccess(false);
    setError(null);
    
    try {
        const accountInfo = api.getAccountInfo();
        const isTeacher = accountInfo?.accountType === "TEACHER";

        // Konwersja Mapy na tablicę do wysłania
        const attendanceData = Array.from(attendance.values());

        // Wysyłamy żądania równolegle
        await Promise.all(attendanceData.map(async (record) => {
            
            const payload = {
                id: record.id, // Może być undefined (nowy) lub number (edycja)
                date: today, 
                status: record.status, 
                arrivalTime: formatTimeForBackend(record.arrivalTime),  
                departureTime: formatTimeForBackend(record.departureTime), 
                preschoolerId: Number(record.preschoolerId),
                recordedById: Number(accountInfo?.id)
            };
            
            try {
                if (record.id) {
                     // --- PUT: Aktualizacja istniejącego rekordu --- 
                     // Endpoint: /api/attendance/{id}
                     await api.put(`/attendance/${record.id}`, payload);
                } else {
                     // --- POST: Tworzenie nowego rekordu --- 
                     // Endpoint: /api/attendance
                     await api.post("/attendance", payload);
                }
            } catch (reqError: any) {
                console.error(`Failed request for child ${record.preschoolerId}`, reqError);
                throw reqError;
            }
        }));

        setSuccess(true);
        // Automatyczny powrót po 1.5 sekundy
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
      {/* HEADER */}
      <div className={styles.header}>
        <div style={{ display: 'flex', gap: '10px' }}>
            { !api.getAccountInfo()?.accountType?.includes("TEACHER") && (
            <button onClick={onBack} className={styles.backButton}>
                <ArrowLeft size={16} /> Back to Groups
            </button>
            )}

            <button 
                onClick={onHistoryClick} 
                className={styles.historyButton} 
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '0.375rem', background: '#fff', cursor: 'pointer' }}
            >
                <Calendar size={16} /> Group History
            </button>
        </div>

        <div className={styles.headerInfo}>
          <h1 className={styles.title}>
            Attendance - {group?.groupName || `Group ${groupId}`}
          </h1>
          <p className={styles.date}>
            <Clock size={16} /> {today}
          </p>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}
      {success && <div className={styles.successBanner}>Saved successfully!</div>}

      {/* GRID KART UCZNIÓW */}
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
                            <label>Arrival:</label>
                            <input 
                                type="time" 
                                value={record.arrivalTime || ""} 
                                onChange={(e) => updateAttendance(child.id, "arrivalTime", e.target.value)} 
                                disabled={saving} 
                            />
                        </div>
                        <div className={styles.timeInput}>
                            <label>Departure:</label>
                            <input 
                                type="time" 
                                value={record.departureTime || ""} 
                                onChange={(e) => updateAttendance(child.id, "departureTime", e.target.value)} 
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
        <button onClick={handleSaveAll} disabled={saving} className={styles.saveButton}>
            <Save size={16} /> {saving ? "Saving..." : "Save Attendance"}
        </button>
      </div>
    </div>
  );
}