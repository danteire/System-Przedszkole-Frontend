import React, { useState } from "react";
import { X, RefreshCw, Save, AlertTriangle } from "lucide-react";
import { api } from "~/utils/serviceAPI";
import styles from "../AttendanceView.module.css";
import type { AttendanceRecord } from "../attendanceTypes";

interface ExcuseAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  childId: number;
}

export const ExcuseAbsenceModal: React.FC<ExcuseAbsenceModalProps> = ({ isOpen, onClose, onSuccess, childId }) => {
  const [excuseMode, setExcuseMode] = useState<"SINGLE" | "RANGE">("SINGLE");
  const [excuseDate, setExcuseDate] = useState(new Date().toISOString().split('T')[0]);
  const [excuseStartDate, setExcuseStartDate] = useState("");
  const [excuseEndDate, setExcuseEndDate] = useState("");
  
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [conflicts, setConflicts] = useState<AttendanceRecord[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const getDatesInRange = (startDate: string, endDate: string) => {
    const date = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    while (date <= end) {
      dates.push(new Date(date).toISOString().split('T')[0]);
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };

  // Krok 1: Sprawdź konflikty
  const handleCheckAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId) return;
    
    // Resetuj stan konfliktów
    setConflicts([]);
    setShowConfirm(false);

    let targetDates: string[] = [];
    if (excuseMode === "SINGLE") {
        targetDates = [excuseDate];
    } else {
        if (!excuseStartDate || !excuseEndDate) {
            alert("Please select both start and end dates.");
            return;
        }
        if (new Date(excuseStartDate) > new Date(excuseEndDate)) {
            alert("Start date cannot be after end date.");
            return;
        }
        targetDates = getDatesInRange(excuseStartDate, excuseEndDate);
    }

    setChecking(true);

    try {
        // Pobierz aktualną historię dziecka, żeby sprawdzić konflikty
        // 
        const history = await api.get<AttendanceRecord[]>(`/attendance/preschooler/${childId}`);
        const existingRecords = Array.isArray(history) ? history : [];

        // Znajdź rekordy, które pokrywają się z wybranymi datami
        const foundConflicts = existingRecords.filter(r => r.date && targetDates.includes(r.date));

        if (foundConflicts.length > 0) {
            setConflicts(foundConflicts);
            setShowConfirm(true); // Pokaż widok potwierdzenia
        } else {
            // Brak konfliktów - wyślij od razu
            await executeSubmission(targetDates, []);
        }

    } catch (error) {
        console.error("Error checking attendance:", error);
        alert("Failed to check existing attendance records.");
    } finally {
        setChecking(false);
    }
  };

  // Krok 2: Wykonaj zapis (POST lub PUT)
  const executeSubmission = async (dates: string[], existingRecords: AttendanceRecord[]) => {
    setSubmitting(true);
    try {
        const accountInfo = api.getAccountInfo();
        
        await Promise.all(dates.map(async (date) => {
            // Sprawdź czy dla tej daty istnieje już rekord (w pobranych wcześniej danych)
            const existingRecord = existingRecords.find(r => r.date === date);

            const payload = {
                id: existingRecord?.id, // ID potrzebne do PUT
                date: date,
                status: "EXCUSED",
                arrivalTime: null,
                departureTime: null,
                preschoolerId: childId,
                recordedById: accountInfo?.id
            };

            if (existingRecord?.id) {
                // PUT - Aktualizacja istniejącego rekordu
                await api.put(`/attendance/${existingRecord.id}`, payload);
            } else {
                // POST - Nowy rekord
                await api.post("/attendance", payload);
            }
        }));

        alert("Absence reported successfully.");
        onSuccess();
        onClose();
    } catch (error) {
        console.error("Failed to submit excuse:", error);
        alert("Failed to save absence. Please try again.");
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
        <div style={{
            backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '450px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto'
        }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h3 style={{margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#2d3748'}}>
                   Report Absence
                </h3>
                <button onClick={onClose} style={{border: 'none', background: 'none', cursor: 'pointer', color: '#a0aec0'}}>
                    <X size={24} />
                </button>
            </div>

            {!showConfirm ? (
                // --- FORMULARZ WYBORU DAT ---
                <form onSubmit={handleCheckAndSubmit}>
                    <div style={{display: 'flex', gap: '10px', marginBottom: '20px', background: '#f7fafc', padding: '4px', borderRadius: '8px'}}>
                        <button
                            type="button"
                            onClick={() => setExcuseMode("SINGLE")}
                            style={{
                                flex: 1, padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600,
                                backgroundColor: excuseMode === "SINGLE" ? 'white' : 'transparent',
                                color: excuseMode === "SINGLE" ? '#3182ce' : '#718096',
                                boxShadow: excuseMode === "SINGLE" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            Single Day
                        </button>
                        <button
                            type="button"
                            onClick={() => setExcuseMode("RANGE")}
                            style={{
                                flex: 1, padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600,
                                backgroundColor: excuseMode === "RANGE" ? 'white' : 'transparent',
                                color: excuseMode === "RANGE" ? '#3182ce' : '#718096',
                                boxShadow: excuseMode === "RANGE" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            Date Range
                        </button>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        {excuseMode === "SINGLE" ? (
                            <div>
                                <label style={{display: 'block', marginBottom: '6px', fontWeight: 600, color: '#4a5568', fontSize: '0.9rem'}}>Date</label>
                                <input 
                                    type="date" 
                                    value={excuseDate}
                                    onChange={(e) => setExcuseDate(e.target.value)}
                                    style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0'}}
                                    required
                                />
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{display: 'block', marginBottom: '6px', fontWeight: 600, color: '#4a5568', fontSize: '0.9rem'}}>From</label>
                                    <input 
                                        type="date" 
                                        value={excuseStartDate}
                                        onChange={(e) => setExcuseStartDate(e.target.value)}
                                        style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0'}}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{display: 'block', marginBottom: '6px', fontWeight: 600, color: '#4a5568', fontSize: '0.9rem'}}>To</label>
                                    <input 
                                        type="date" 
                                        value={excuseEndDate}
                                        onChange={(e) => setExcuseEndDate(e.target.value)}
                                        style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0'}}
                                        required
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                        <button 
                            type="button" 
                            onClick={onClose}
                            style={{ padding: '10px 20px', border: 'none', borderRadius: '6px', background: 'transparent', color: '#718096', fontWeight: 600, cursor: 'pointer' }}
                            disabled={checking}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            style={{
                                padding: '10px 20px', border: 'none', borderRadius: '6px', background: '#3182ce', 
                                color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                            disabled={checking}
                        >
                            {checking ? <RefreshCw size={18} className="animate-spin" /> : "Check & Submit"}
                        </button>
                    </div>
                </form>
            ) : (
                // --- EKRAN POTWIERDZENIA KONFLIKTÓW ---
                <div>
                    <div style={{backgroundColor: '#fffaf0', border: '1px solid #fbd38d', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
                        <div style={{display: 'flex', gap: '10px', alignItems: 'center', color: '#c05621', fontWeight: 'bold', marginBottom: '10px'}}>
                            <AlertTriangle size={24} />
                            Attention: Existing Records Found
                        </div>
                        <p style={{margin: 0, color: '#744210', fontSize: '0.9rem'}}>
                            The following dates already have an attendance status. Proceeding will overwrite them with "EXCUSED".
                        </p>
                        <ul style={{marginTop: '10px', paddingLeft: '20px', color: '#744210'}}>
                            {conflicts.map(c => (
                                <li key={c.id}>
                                    <strong>{c.date}</strong>: Current status is <span style={{fontWeight: 'bold'}}>{c.status}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                        <button 
                            type="button" 
                            onClick={() => setShowConfirm(false)}
                            style={{ padding: '10px 20px', border: 'none', borderRadius: '6px', background: '#edf2f7', color: '#4a5568', fontWeight: 600, cursor: 'pointer' }}
                            disabled={submitting}
                        >
                            Back
                        </button>
                        <button 
                            type="button" 
                            onClick={() => {
                                // Wywołujemy zapis, przekazując listę dat (z formularza) i listę konfliktów (by wiedzieć, które to PUT)
                                let targetDates = excuseMode === "SINGLE" ? [excuseDate] : getDatesInRange(excuseStartDate, excuseEndDate);
                                executeSubmission(targetDates, conflicts);
                            }}
                            style={{
                                padding: '10px 20px', border: 'none', borderRadius: '6px', background: '#e53e3e', 
                                color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                            disabled={submitting}
                        >
                            {submitting ? <RefreshCw size={18} className="animate-spin" /> : "Overwrite & Save"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};