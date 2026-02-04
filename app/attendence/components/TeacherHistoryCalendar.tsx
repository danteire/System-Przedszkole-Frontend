import React, { useState, useEffect } from 'react';
import { api } from '~/utils/serviceAPI';
import { ChevronLeft, ChevronRight, ArrowLeft, RefreshCw, Calendar as CalendarIcon, Users } from 'lucide-react';
import styles from '../AttendanceView.module.css';
import type { AttendanceRecord } from '../attendanceTypes';

interface Props {
  groupId: number;
  onSelectDate: (date: string) => void;
  onBack: () => void;
}

export const TeacherHistoryCalendar: React.FC<Props> = ({ groupId, onSelectDate, onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get<AttendanceRecord[]>(`/attendance/group/${groupId}`);
        setAttendanceData(Array.isArray(response) ? response : []);
      } catch (e) {
        console.error("Failed to fetch group history", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [groupId]);

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => (new Date(date.getFullYear(), date.getMonth(), 1).getDay() + 6) % 7;

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={styles.calendarDayEmpty}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Znajdź wszystkie rekordy dla tego dnia
      const dayRecords = attendanceData.filter(r => r.date === dateString);
      const hasRecords = dayRecords.length > 0;
      
      // Statystyki dla dnia
      const presentCount = dayRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
      
      let dayContent = <span className={styles.dayNumber}>{day}</span>;
      let dayClass = styles.calendarDayDefault;

      if (hasRecords) {
          dayClass = styles.calendarDayHasData; // Nowa klasa w CSS
          dayContent = (
              <>
                <span className={styles.dayNumber}>{day}</span>
                <div className={styles.dayStats}>
                    <Users size={12} style={{marginRight: '2px'}}/> {presentCount}
                </div>
              </>
          );
      }

      days.push(
        <div 
          key={day} 
          className={`${styles.calendarDay} ${dayClass}`}
          onClick={() => {
              // Pozwalamy klikać w każdy dzień, nawet pusty (by zobaczyć puste zestawienie) lub tylko w te z danymi
              onSelectDate(dateString);
          }}
        >
          {dayContent}
        </div>
      );
    }
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  if (loading) return <div className={styles.loading}><RefreshCw className={styles.spinner} /> Loading history...</div>;

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>Group History</h1>
          <p className={styles.date}>Select a day to view attendance list</p>
        </div>
      </div>

      {/* CALENDAR CONTAINER */}
      <div className={styles.calendarContainer}>
        
        {/* Navigation */}
        <div className={styles.calendarHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '1.5rem' }}>
            <button onClick={handlePrevMonth} className={styles.navButton}>
                <ChevronLeft size={24} />
            </button>
            <h3 className={styles.calendarTitle} style={{ minWidth: '200px', textAlign: 'center', fontSize: '1.4rem' }}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button onClick={handleNextMonth} className={styles.navButton}>
                <ChevronRight size={24} />
            </button>
        </div>
        
        {/* Days Header */}
        <div className={styles.weekDaysHeader}>
            <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
        </div>
        
        {/* Grid */}
        <div className={styles.calendarGrid}>
            {renderCalendar()}
        </div>
      </div>
    </div>
  );
};