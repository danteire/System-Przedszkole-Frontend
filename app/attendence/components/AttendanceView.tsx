import { useState } from "react";
import AttendanceToday from "./AttendanceToday";
import HistoryDetailsTable from "./HistoryDetailsTable";
import { TeacherHistoryCalendar } from "./TeacherHistoryCalendar"; // Nowy komponent kalendarza dla nauczyciela
import type { AttendanceRecord } from "../attendanceTypes";

interface AttendanceViewProps {
  groupId: number;
  onBack: () => void;
}

type ViewMode = 'today' | 'history_calendar' | 'history_details';

export default function AttendanceView({ groupId, onBack }: AttendanceViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);

  // 1. Widok Kalendarza Historii
  if (viewMode === 'history_calendar') {
    return (
        <TeacherHistoryCalendar 
            groupId={groupId} 
            onSelectDate={(date) => {
                setSelectedHistoryDate(date);
                setViewMode('history_details');
            }}
            onBack={() => setViewMode('today')}
        />
    );
  }

  // 2. Widok Szczegółów Dnia
  if (viewMode === 'history_details' && selectedHistoryDate) {
      return (
          <HistoryDetailsTable 
            groupId={groupId}
            date={selectedHistoryDate}
            records={[]} 
            fetchStrategy="byDate" 
            onBack={() => setViewMode('history_calendar')}
          />
      );
  }

  // 3. Widok Główny (Dzisiaj)
  return (
    <AttendanceToday 
        groupId={groupId} 
        onBack={onBack} 
        onHistoryClick={() => setViewMode('history_calendar')}
    />
  );
}