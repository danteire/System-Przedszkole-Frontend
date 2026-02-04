import React, { useState } from "react";
import { X, RefreshCw, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "~/utils/serviceAPI";
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

  // --- NEW: Error and Success States ---
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  const handleCheckAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId) return;
    
    // Reset messages
    setError(null);
    setSuccessMsg(null);
    setConflicts([]);
    setShowConfirm(false);

    let targetDates: string[] = [];
    if (excuseMode === "SINGLE") {
        targetDates = [excuseDate];
    } else {
        if (!excuseStartDate || !excuseEndDate) {
            setError("Please select both start and end dates.");
            return;
        }
        if (new Date(excuseStartDate) > new Date(excuseEndDate)) {
            setError("Start date cannot be after end date.");
            return;
        }
        targetDates = getDatesInRange(excuseStartDate, excuseEndDate);
    }

    setChecking(true);

    try {
        const history = await api.get<AttendanceRecord[]>(`/attendance/preschooler/${childId}`);
        const existingRecords = Array.isArray(history) ? history : [];

        const foundConflicts = existingRecords.filter(r => r.date && targetDates.includes(r.date));

        if (foundConflicts.length > 0) {
            setConflicts(foundConflicts);
            setShowConfirm(true);
        } else {
            await executeSubmission(targetDates, []);
        }

    } catch (error) {
        console.error("Error checking attendance:", error);
        setError("Failed to check existing attendance records.");
    } finally {
        setChecking(false);
    }
  };

  const executeSubmission = async (dates: string[], existingRecords: AttendanceRecord[]) => {
    setSubmitting(true);
    setError(null); // Clear previous errors
    try {
        const accountInfo = api.getAccountInfo();
        
        await Promise.all(dates.map(async (date) => {
            const existingRecord = existingRecords.find(r => r.date === date);

            const payload = {
                id: existingRecord?.id,
                date: date,
                status: "EXCUSED",
                arrivalTime: null,
                departureTime: null,
                preschoolerId: childId,
                recordedById: accountInfo?.id
            };

            if (existingRecord?.id) {
                await api.put(`/attendance/${existingRecord.id}`, payload);
            } else {
                await api.post("/attendance", payload);
            }
        }));

        setSuccessMsg("Absence reported successfully.");
        
        // Wait a moment before closing to show success message
        setTimeout(() => {
            onSuccess();
            onClose();
            // Reset state for next open
            setSuccessMsg(null);
            setShowConfirm(false);
        }, 1500);

    } catch (error) {
        console.error("Failed to submit excuse:", error);
        setError("Failed to save absence. Please try again.");
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(37, 38, 65, 0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
    }}>
        <div style={{
            backgroundColor: 'white', padding: '24px', borderRadius: '20px', width: '90%', maxWidth: '450px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxHeight: '90vh', overflowY: 'auto'
        }}>
            
            {/* Header */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0'}}>
                <h3 style={{margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#2d3748'}}>
                   Report Absence
                </h3>
                <button onClick={onClose} style={{border: 'none', background: '#f7fafc', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#718096'}}>
                    <X size={20} />
                </button>
            </div>

            {/* ERROR MESSAGE BANNER */}
            {error && (
                <div style={{
                    backgroundColor: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '8px', 
                    padding: '12px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', color: '#C53030'
                }}>
                    <AlertCircle size={20} />
                    <span style={{fontSize: '0.9rem', fontWeight: 600}}>{error}</span>
                </div>
            )}

            {/* SUCCESS MESSAGE BANNER */}
            {successMsg && (
                <div style={{
                    backgroundColor: '#F0FFF4', border: '1px solid #9AE6B4', borderRadius: '8px', 
                    padding: '12px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', color: '#2F855A'
                }}>
                    <CheckCircle size={20} />
                    <span style={{fontSize: '0.9rem', fontWeight: 600}}>{successMsg}</span>
                </div>
            )}

            {!showConfirm ? (
                // --- FORMULARZ WYBORU DAT ---
                <form onSubmit={handleCheckAndSubmit}>
                    <div style={{display: 'flex', gap: '5px', marginBottom: '20px', background: '#EDF2F7', padding: '4px', borderRadius: '10px'}}>
                        <button
                            type="button"
                            onClick={() => setExcuseMode("SINGLE")}
                            style={{
                                flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s',
                                backgroundColor: excuseMode === "SINGLE" ? 'white' : 'transparent',
                                color: excuseMode === "SINGLE" ? 'var(--color-primary, #ED8936)' : '#718096',
                                boxShadow: excuseMode === "SINGLE" ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            Single Day
                        </button>
                        <button
                            type="button"
                            onClick={() => setExcuseMode("RANGE")}
                            style={{
                                flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s',
                                backgroundColor: excuseMode === "RANGE" ? 'white' : 'transparent',
                                color: excuseMode === "RANGE" ? 'var(--color-primary, #ED8936)' : '#718096',
                                boxShadow: excuseMode === "RANGE" ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            Date Range
                        </button>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        {excuseMode === "SINGLE" ? (
                            <div>
                                <label style={{display: 'block', marginBottom: '8px', fontWeight: 700, color: '#4a5568', fontSize: '0.9rem'}}>Date</label>
                                <input 
                                    type="date" 
                                    value={excuseDate}
                                    onChange={(e) => setExcuseDate(e.target.value)}
                                    style={{width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem', outline: 'none', color: '#2D3748'}}
                                    required
                                />
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 700, color: '#4a5568', fontSize: '0.9rem'}}>From</label>
                                    <input 
                                        type="date" 
                                        value={excuseStartDate}
                                        onChange={(e) => setExcuseStartDate(e.target.value)}
                                        style={{width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', color: '#2D3748'}}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 700, color: '#4a5568', fontSize: '0.9rem'}}>To</label>
                                    <input 
                                        type="date" 
                                        value={excuseEndDate}
                                        onChange={(e) => setExcuseEndDate(e.target.value)}
                                        style={{width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', color: '#2D3748'}}
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
                            style={{ padding: '10px 20px', border: 'none', borderRadius: '99px', background: 'transparent', color: '#718096', fontWeight: 700, cursor: 'pointer' }}
                            disabled={checking || submitting}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            style={{
                                padding: '10px 24px', border: 'none', borderRadius: '99px', background: 'var(--color-primary, #ED8936)', 
                                color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                boxShadow: '0 4px 6px rgba(237, 137, 54, 0.2)'
                            }}
                            disabled={checking || submitting}
                        >
                            {checking ? <RefreshCw size={18} className="animate-spin" /> : "Check & Submit"}
                        </button>
                    </div>
                </form>
            ) : (
                // --- EKRAN POTWIERDZENIA KONFLIKTÓW ---
                <div className="animate-fade-in">
                    <div style={{backgroundColor: '#FFF5F5', border: '1px solid #FED7D7', padding: '16px', borderRadius: '12px', marginBottom: '24px'}}>
                        <div style={{display: 'flex', gap: '10px', alignItems: 'center', color: '#C53030', fontWeight: '800', marginBottom: '8px'}}>
                            <AlertTriangle size={24} />
                            Attention
                        </div>
                        <p style={{margin: 0, color: '#742A2A', fontSize: '0.95rem', lineHeight: '1.5'}}>
                            The following dates already have an attendance status. Proceeding will <strong style={{textDecoration: 'underline'}}>overwrite</strong> them with "EXCUSED".
                        </p>
                        <ul style={{marginTop: '12px', paddingLeft: '20px', color: '#742A2A', fontSize: '0.9rem'}}>
                            {conflicts.map(c => (
                                <li key={c.id} style={{marginBottom: '4px'}}>
                                    <strong>{c.date}</strong>: Currently <span style={{fontWeight: 'bold', background: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid #fc8181'}}>{c.status}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                        <button 
                            type="button" 
                            onClick={() => setShowConfirm(false)}
                            style={{ padding: '10px 20px', border: 'none', borderRadius: '99px', background: '#EDF2F7', color: '#4A5568', fontWeight: 700, cursor: 'pointer' }}
                            disabled={submitting}
                        >
                            Back
                        </button>
                        <button 
                            type="button" 
                            onClick={() => {
                                let targetDates = excuseMode === "SINGLE" ? [excuseDate] : getDatesInRange(excuseStartDate, excuseEndDate);
                                executeSubmission(targetDates, conflicts);
                            }}
                            style={{
                                padding: '10px 24px', border: 'none', borderRadius: '99px', background: '#E53E3E', 
                                color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                boxShadow: '0 4px 6px rgba(229, 62, 62, 0.3)'
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