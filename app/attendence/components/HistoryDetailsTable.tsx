import { useState, useEffect } from "react";
import { api } from "~/utils/serviceAPI";
import { ArrowLeft, RefreshCw, Clock, Calendar, Edit2, Save, X, AlertTriangle } from "lucide-react";
import styles from "../AttendanceView.module.css";
import type { AttendanceRecord, Preschooler } from "../attendanceTypes";

interface Props {
  groupId: number;
  date: string;
  records: AttendanceRecord[]; 
  fetchStrategy?: 'manual' | 'byDate'; 
  onBack: () => void;
}

interface DisplayRecord extends AttendanceRecord {
  firstName: string;
  lastName: string;
}

export default function HistoryDetailsTable({ groupId, date, records: initialRecords, fetchStrategy = 'manual', onBack }: Props) {
  const [displayRecords, setDisplayRecords] = useState<DisplayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- Stan edycji ---
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<AttendanceRecord>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  
  // --- Stan błędu (zamiast alert) ---
  const [error, setError] = useState<string | null>(null);

  const fetchDataAndMerge = async () => {
    setLoading(true);
    setError(null);
    try {
      let recordsToProcess = initialRecords;

      if (fetchStrategy === 'byDate') {
           const allGroupAttendance = await api.get<AttendanceRecord[]>(`/attendance/group/${groupId}`);
           const allData = Array.isArray(allGroupAttendance) ? allGroupAttendance : [];
           recordsToProcess = allData.filter(r => r.date === date);
      }

      const preschoolersRes = await api.get<Preschooler[]>(`/preschoolers/group/${groupId}`);
      const preschoolersData = Array.isArray(preschoolersRes) ? preschoolersRes : [];

      const merged = recordsToProcess.map(record => {
        const child = preschoolersData.find(p => p.id === record.preschoolerId);
        return {
          ...record,
          firstName: child?.firstName || "Unknown",
          lastName: child?.lastName || "Child"
        };
      });

      merged.sort((a, b) => a.lastName.localeCompare(b.lastName));
      setDisplayRecords(merged);

    } catch (e) {
      console.error("Failed to fetch details", e);
      setError("Failed to load records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataAndMerge();
  }, [groupId, date, initialRecords, fetchStrategy]);

  // --- Funkcje edycji ---

  const startEditing = (record: DisplayRecord) => {
    setError(null); // Czyść błędy przy rozpoczęciu edycji
    if (record.id !== undefined) {
      setEditingId(record.id);
    }
    setEditForm({
      status: record.status,
      arrivalTime: record.arrivalTime ? record.arrivalTime.substring(0, 5) : "",
      departureTime: record.departureTime ? record.departureTime.substring(0, 5) : ""
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
    setError(null);
  };

  const saveRecord = async (recordId: number) => {
    setError(null);

    // --- WALIDACJA ---
    const status = editForm.status;
    const arr = editForm.arrivalTime;
    const dep = editForm.departureTime;

    // 1. Wymagalność obu godzin dla obecnych
    if (status === 'PRESENT' || status === 'LATE') {
        if (!arr || !dep) {
            setError("Both Arrival and Departure times are required for Present/Late status.");
            return;
        }
    }

    // 2. Kolejność logiczna (Wyjście > Wejście)
    if (arr && dep) {
        const arrNum = parseInt(arr.replace(':', ''), 10);
        const depNum = parseInt(dep.replace(':', ''), 10);

        if (depNum <= arrNum) {
            setError("Departure time cannot be earlier than or equal to Arrival time.");
            return;
        }
    }

    // --- ZAPIS ---
    setSavingId(recordId);
    try {
      const originalRecord = displayRecords.find(r => r.id === recordId);
      if (!originalRecord) return;

      const payload = {
        ...originalRecord,
        status: editForm.status,
        arrivalTime: editForm.arrivalTime ? (editForm.arrivalTime.length === 5 ? `${editForm.arrivalTime}:00` : editForm.arrivalTime) : null,
        departureTime: editForm.departureTime ? (editForm.departureTime.length === 5 ? `${editForm.departureTime}:00` : editForm.departureTime) : null,
      };

      // Usuwamy pola display przed wysłaniem
      const { firstName, lastName, ...apiPayload } = payload; 

      await api.put(`/attendance/${recordId}`, apiPayload);
      
      await fetchDataAndMerge();
      setEditingId(null);
    } catch (error) {
      console.error("Failed to save record", error);
      setError("Failed to save changes due to server error.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <div className={styles.loading}><RefreshCw className={styles.spinner} /> Loading details...</div>;

  const gridTemplate = "1fr 1fr 140px 110px 110px 80px";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>History: {date}</h1>
          <p className={styles.date}>
              <Calendar size={16} style={{ display: 'inline', marginBottom: '-2px', marginRight: '6px' }} /> 
              Edit past attendance records
          </p>
        </div>
      </div>

      {/* --- BANER Z BŁĘDEM --- */}
      {error && (
          <div className={styles.errorBanner} style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
              <AlertTriangle size={20} />
              {error}
          </div>
      )}

      <div className={styles.historySection}>
        <div className={styles.historyHeaderRow} style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '1rem', alignItems: 'center' }}>
          <div style={{ paddingLeft: '20px' }}>First Name</div>
          <div>Last Name</div>
          <div style={{ textAlign: 'center' }}>Status</div>
          <div style={{ textAlign: 'center' }}>Arrival</div>
          <div style={{ textAlign: 'center' }}>Departure</div>
          <div style={{ textAlign: 'center' }}>Action</div>
        </div>

        {displayRecords.map((rec) => {
          const isEditing = editingId === rec.id;
          const isSaving = savingId === rec.id;

          return (
            <div key={rec.id} className={styles.historyRow} style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '1rem', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
              
              <div className={styles.cell} style={{ paddingLeft: '20px', fontWeight: 600 }}>{rec.firstName}</div>
              <div className={styles.cell} style={{ fontWeight: 600 }}>{rec.lastName}</div>
              
              {/* Status */}
              <div style={{ textAlign: 'center' }}>
                {isEditing ? (
                    <select 
                        className={styles.formSelect} 
                        style={{ padding: '4px', borderRadius: '6px', width: '100%', border: '1px solid #cbd5e0' }}
                        value={editForm.status}
                        onChange={e => setEditForm({...editForm, status: e.target.value as AttendanceRecord['status']})}
                    >
                        <option value="PRESENT">PRESENT</option>
                        <option value="ABSENT">ABSENT</option>
                        <option value="LATE">LATE</option>
                        <option value="EXCUSED">EXCUSED</option>
                    </select>
                ) : (
                    <span className={`${styles.statusBadge} ${styles['status' + rec.status]}`}>{rec.status}</span>
                )}
              </div>
              
              {/* Arrival */}
              <div className={`${styles.cell} ${styles.fontMono}`} style={{ justifyContent: 'center' }}>
                  {isEditing ? (
                      <input 
                        type="time" 
                        value={editForm.arrivalTime || ""} 
                        onChange={e => setEditForm({...editForm, arrivalTime: e.target.value})}
                        style={{ 
                            padding: '4px', borderRadius: '4px', border: '1px solid #ccc', width: '100%',
                            borderColor: (!editForm.arrivalTime && (editForm.status === 'PRESENT' || editForm.status === 'LATE')) ? 'red' : '#ccc'
                        }}
                        disabled={editForm.status === 'ABSENT' || editForm.status === 'EXCUSED'}
                      />
                  ) : (
                      rec.arrivalTime ? rec.arrivalTime.substring(0, 5) : "-"
                  )}
              </div>
              
              {/* Departure */}
              <div className={`${styles.cell} ${styles.fontMono}`} style={{ justifyContent: 'center' }}>
                  {isEditing ? (
                      <input 
                        type="time" 
                        value={editForm.departureTime || ""} 
                        onChange={e => setEditForm({...editForm, departureTime: e.target.value})}
                        style={{ 
                            padding: '4px', borderRadius: '4px', border: '1px solid #ccc', width: '100%',
                            borderColor: (!editForm.departureTime && (editForm.status === 'PRESENT' || editForm.status === 'LATE')) ? 'red' : '#ccc'
                        }}
                        disabled={editForm.status === 'ABSENT' || editForm.status === 'EXCUSED'}
                      />
                  ) : (
                      rec.departureTime ? rec.departureTime.substring(0, 5) : "-"
                  )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {isEditing ? (
                      <>
                        <button 
                            onClick={() => rec.id !== undefined && saveRecord(rec.id)} 
                            disabled={isSaving}
                            style={{ background: '#48BB78', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', color: 'white' }}
                            title="Save"
                        >
                            {isSaving ? <RefreshCw size={16} className={styles.spinner} /> : <Save size={16} />}
                        </button>
                        <button 
                            onClick={cancelEditing} 
                            disabled={isSaving}
                            style={{ background: '#F56565', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', color: 'white' }}
                            title="Cancel"
                        >
                            <X size={16} />
                        </button>
                      </>
                  ) : (
                      <button 
                        onClick={() => startEditing(rec)} 
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#718096' }}
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                  )}
              </div>

            </div>
          );
        })}

        {displayRecords.length === 0 && (
          <div className={styles.empty} style={{ padding: '2rem' }}>
            <span>No records found for this date.</span>
          </div>
        )}
      </div>
    </div>
  );
}