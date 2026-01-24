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
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);
  const [selectedHistoryRecords, setSelectedHistoryRecords] = useState<AttendanceRecord[]>([]);

  // 1. Widok Historii (Lista dat)
  if (viewMode === 'history_dates') {
    return (
        <HistoryDatesTable 
            groupId={groupId} 
            onSelectDate={(date, records) => {
                setSelectedHistoryDate(date);
                setSelectedHistoryRecords(records);
                setViewMode('history_details');
            }}
            onBack={() => setViewMode('today')}
        />
    );
  }

  if (viewMode === 'history_details' && selectedHistoryDate) {
      return (
          <HistoryDetailsTable 
            groupId={groupId}
            date={selectedHistoryDate}
            records={selectedHistoryRecords} 
            onBack={() => setViewMode('history_dates')}
          />
      );
  }

  return (
    <AttendanceToday 
        groupId={groupId} 
        onBack={onBack} 
        onHistoryClick={() => setViewMode('history_dates')}
    />
  );
}