// app/routes/attendance/AttendanceView.tsx
import { useState } from "react";
import AttendanceToday from "./AttendanceToday";
import HistoryDatesTable from "./HistoryDatesTable";
import HistoryDetailsTable from "./HistoryDetailsTable";
import type { AttendanceRecord } from "./attendanceTypes"; // Upewnij się, że ścieżka do typu jest poprawna

interface AttendanceViewProps {
  groupId: number;
  onBack: () => void;
}

type ViewMode = 'today' | 'history_dates' | 'history_details';

export default function AttendanceView({ groupId, onBack }: AttendanceViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  
  // Stan dla wybranej daty
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);
  
  // NOWY STAN: Przechowuje rekordy obecności dla wybranej daty (żeby nie pobierać ich 2x)
  const [selectedHistoryRecords, setSelectedHistoryRecords] = useState<AttendanceRecord[]>([]);

  // 1. Widok Historii (Lista dat)
  if (viewMode === 'history_dates') {
    return (
        <HistoryDatesTable 
            groupId={groupId} 
            // ZMIANA: Odbieramy teraz dwa argumenty: datę i przefiltrowane rekordy
            onSelectDate={(date, records) => {
                setSelectedHistoryDate(date);
                setSelectedHistoryRecords(records); // Zapisujemy rekordy w stanie
                setViewMode('history_details');
            }}
            onBack={() => setViewMode('today')}
        />
    );
  }

  // 2. Widok Szczegółów Historii (Konkretny dzień)
  if (viewMode === 'history_details' && selectedHistoryDate) {
      return (
          <HistoryDetailsTable 
            groupId={groupId}
            date={selectedHistoryDate}
            records={selectedHistoryRecords} // ZMIANA: Przekazujemy gotowe dane
            onBack={() => setViewMode('history_dates')}
          />
      );
  }

  // 3. Widok Domyślny (Dzisiejsza obecność)
  return (
    <AttendanceToday 
        groupId={groupId} 
        onBack={onBack} 
        onHistoryClick={() => setViewMode('history_dates')}
    />
  );
}