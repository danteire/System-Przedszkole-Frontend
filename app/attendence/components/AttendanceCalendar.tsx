import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, X, Clock, FileText, CalendarX } from 'lucide-react'; // Dodano CalendarX
import styles from '../AttendanceView.module.css'; 
import type { AttendanceRecord } from '../attendanceTypes';

interface Props {
  history: AttendanceRecord[];
  onDayClick: (record: AttendanceRecord | null, date: string) => void;
  // Nowy prop do otwierania modala zgłaszania nieobecności
  onOpenExcuseModal: () => void;
}

export const AttendanceCalendar: React.FC<Props> = ({ history, onDayClick, onOpenExcuseModal }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    // 0 = Poniedziałek
    return (new Date(year, month, 1).getDay() + 6) % 7;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={styles.calendarDayEmpty}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const record = history.find(r => r.date === dateString);
      
      let statusClass = styles.calendarDayDefault;
      let Icon = null;

      if (record) {
        switch (record.status) {
          case 'PRESENT':
            statusClass = styles.calendarDayPresent;
            Icon = Check;
            break;
          case 'ABSENT':
            statusClass = styles.calendarDayAbsent;
            Icon = X;
            break;
          case 'LATE':
            statusClass = styles.calendarDayLate;
            Icon = Clock;
            break;
          case 'EXCUSED':
            statusClass = styles.calendarDayExcused;
            Icon = FileText;
            break;
        }
      }

      days.push(
        <div 
          key={day} 
          className={`${styles.calendarDay} ${statusClass}`}
          onClick={() => onDayClick(record || null, dateString)}
        >
          <span className={styles.dayNumber}>{day}</span>
          {Icon && <Icon size={16} className={styles.dayIcon} />}
        </div>
      );
    }

    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className={styles.calendarContainer}>
      
      {/* HEADER: Navigation + Report Button */}
      <div className={styles.calendarHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        
        {/* Navigation Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={handlePrevMonth} className={styles.navButton}>
            <ChevronLeft size={24} />
            </button>
            <h3 className={styles.calendarTitle} style={{ minWidth: '150px', textAlign: 'center' }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button onClick={handleNextMonth} className={styles.navButton}>
            <ChevronRight size={24} />
            </button>
        </div>

        {/* Report Absence Button (Przeniesiony tutaj) */}
        <button onClick={onOpenExcuseModal} className={styles.actionBtn}>
            <CalendarX size={18} />
            Report Absence
        </button>

      </div>
      
      <div className={styles.weekDaysHeader}>
        <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
      </div>
      
      <div className={styles.calendarGrid}>
        {renderCalendar()}
      </div>
    </div>
  );
};