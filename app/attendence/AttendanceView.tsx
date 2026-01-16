// app/routes/attendance/AttendanceView.tsx
import { useState } from "react";
import AttendanceToday from "./AttendanceToday";
import HistoryDatesTable from "./HistoryDatesTable";
import HistoryDetailsTable from "./HistoryDetailsTable";

interface AttendanceViewProps {
  groupId: number;
  onBack: () => void;
}

type ViewMode = 'today' | 'history_dates' | 'history_details';

export default function AttendanceView({ groupId, onBack }: AttendanceViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);

  // 1. Widok Historii (Lista dat)
  if (viewMode === 'history_dates') {
    return (
        <HistoryDatesTable 
            groupId={groupId} 
            onSelectDate={(date) => {
                setSelectedHistoryDate(date);
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