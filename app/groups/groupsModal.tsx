import React, { useEffect, useState } from 'react';
import { type ActionFunctionArgs } from "react-router"; // To jest teraz zbędne, ale zostawiamy import

import "./newGroupsModal.css";
import { api } from '~/utils/serviceAPI';

interface NewGroupModalProps {
  show: boolean;
  onHide: () => void;
  occupiedIds: number[]; // Nowy prop z ID, które są już zajęte
}

interface GroupState {
  groupName: string;
  mainCaretakerId: number | string; // ID z inputa jest lepiej trzymać jako string
}
// Dodajemy nowy interfejs dla nauczyciela
interface Teacher {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export default function NewGroupModal({ show, onHide, occupiedIds }: NewGroupModalProps) {
  const [groupState, setGroupState] = useState<GroupState>({
    groupName: '',
    mainCaretakerId: '', // To będzie teraz przechowywać ID z wybranego <option>
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Zmiana: przechowujemy całe obiekty nauczycieli, nie tylko maile
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    if (show) {
      fetchTeachers();
    }
  }, [show]);

  const fetchTeachers = async () => {
    try {
      // Pobieramy pełne dane o kontach nauczycieli
      const response = await api.get<Teacher[]>("/accounts/teachers");
      setTeachers(response);
    } catch (err) {
      console.error("❌ Failed to fetch teachers:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupState.mainCaretakerId) {
        setSubmitError("Wybierz opiekuna grupy.");
        return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/groups", {
        groupName: groupState.groupName,
        mainCaretakerId: Number(groupState.mainCaretakerId)
      });
      setGroupState({ groupName: '', mainCaretakerId: '' });
      onHide();
    } catch (error) {
      setSubmitError("Nie udało się utworzyć grupy.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onHide}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>Create New Group</h2>
        {submitError && <p style={{ color: 'red' }}>{submitError}</p>}
        
        <form className="group-form" onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="groupName" 
            placeholder="Nazwa grupy" 
            required 
            value={groupState.groupName}
            onChange={(e) => setGroupState({...groupState, groupName: e.target.value})}
          />

          {/* ZMIANA: Zamiast inputa typu number, dajemy select */}
          <select 
            name="mainCaretakerId"
            value={groupState.mainCaretakerId}
            onChange={(e) => setGroupState({...groupState, mainCaretakerId: e.target.value})}
            required
            className="teacher-select"
          >
            <option value="">-- Wybierz Opiekuna --</option>
            {teachers.map((teacher) => {
              // Sprawdzamy, czy ten nauczyciel jest już opiekunem innej grupy
              const isOccupied = occupiedIds.includes(teacher.id);

              return (
                <option 
                  key={teacher.id} 
                  value={teacher.id} 
                  disabled={isOccupied} // Blokujemy wybór zajętego nauczyciela
                  style={isOccupied ? { color: '#ccc' } : {}}
                >
                  {teacher.firstName} {teacher.lastName} 
                  {isOccupied ? " (Już przypisany)" : ` (${teacher.email})`}
                </option>
              );
            })}
          </select>
          
          <div className="modal-actions">
            <button type="button" onClick={onHide} disabled={isSubmitting}>Anuluj</button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Tworzenie...' : 'Stwórz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}