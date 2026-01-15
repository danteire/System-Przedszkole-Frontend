import React, { useState } from 'react';
import { type ActionFunctionArgs } from "react-router"; // To jest teraz zbędne, ale zostawiamy import

import "./newGroupsModal.css";
import { api } from '~/utils/serviceAPI';

interface NewGroupModalProps {
  show: boolean;
  onHide: () => void;
}

interface GroupState {
  groupName: string;
  mainCaretakerId: number | string; // ID z inputa jest lepiej trzymać jako string
}

export default function NewGroupModal({ show, onHide }: NewGroupModalProps) {
  // Stan do przechowywania danych formularza
  const [groupState, setGroupState] = useState<GroupState>({
    groupName: '',
    mainCaretakerId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!show) {
    return null;
  }

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupState({
      ...groupState,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    // Walidacja i konwersja ID
    const parsedId = parseInt(groupState.mainCaretakerId as string, 10);
    if (isNaN(parsedId)) {
        setSubmitError("ID Opiekuna musi być liczbą.");
        setIsSubmitting(false);
        return;
    }

    const newGroup = { 
        groupName: groupState.groupName, 
        mainCaretakerId: parsedId 
    };

    try {
      const response = await api.post("/groups", newGroup);
      console.log("Grupa utworzona:", response);
      // Sukces: Zresetuj formularz, zamknij modal i odśwież dane u rodzica
      setGroupState({ groupName: '', mainCaretakerId: '' });
      onHide(); 

    } catch (error) {
      setSubmitError("Nie udało się utworzyć grupy.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onHide}> 
        <div className="modal-box" onClick={handleModalClick}>
          <h2>Create New Group</h2>

          {submitError && <p style={{ color: 'red' }}>{submitError}</p>}
          
          {/* ZMIANA: Używamy natywnego formularza z handlerem handleSubmit */}
          <form className="group-form" onSubmit={handleSubmit}> 
            {/* ZMIANA: Dodano name, value i onChange */}
            <input 
                type="text" 
                name="groupName" 
                placeholder="Group name" 
                required 
                value={groupState.groupName}
                onChange={handleChange}
            />
            {/* ZMIANA: Dodano name, value i onChange */}
            <input 
                type="number" 
                name="mainCaretakerId" 
                placeholder="Main CareTakerID" 
                required 
                value={groupState.mainCaretakerId}
                onChange={handleChange}
            />
            
            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn cancel"
                onClick={onHide}
                disabled={isSubmitting} // Wyłącz, gdy trwa wysyłanie
              >
                Cancel
              </button>

              <button 
                type="submit" 
                className="modal-btn submit"
                disabled={isSubmitting} // Wyłącz, gdy trwa wysyłanie
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}