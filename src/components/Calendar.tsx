import React from 'react';
import type { CalendarDay } from '../types';
import { formatDateToString } from '../utils/dateUtils';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  datesWithHistory: string[]; // Array tanggal dengan format YYYY-MM-DD
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  datesWithHistory
}) => {
  const today = new Date();
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  // Mendapatkan hari pertama dan jumlah hari dalam bulan
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Generate calendar days
  const calendarDays: CalendarDay[] = [];
  
  // Padding days dari bulan sebelumnya
  for (let i = 0; i < startingDayOfWeek; i++) {
    const date = new Date(currentYear, currentMonth, -startingDayOfWeek + i + 1);
    calendarDays.push({
      date,
      hasHistory: false,
      isSelected: false,
      isToday: false
    });
  }  // Hari-hari dalam bulan ini
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateString = formatDateToString(date);
    const isToday = date.toDateString() === today.toDateString();
    const isSelected = date.toDateString() === selectedDate.toDateString();
    const hasHistory = datesWithHistory.includes(dateString);

    calendarDays.push({
      date,
      hasHistory,
      isSelected,
      isToday
    });
  }  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const getMonthName = (monthIndex: number): string => {
    return monthNames.at(monthIndex) ?? 'Unknown';
  };

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const goToPreviousMonth = () => {
    onDateSelect(new Date(currentYear, currentMonth - 1, selectedDate.getDate()));
  };

  const goToNextMonth = () => {
    onDateSelect(new Date(currentYear, currentMonth + 1, selectedDate.getDate()));
  };  return (
    <div className="rounded-lg p-4 shadow-sm border theme-transition" style={{ backgroundColor: 'var(--virpal-content-bg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 theme-transition">        <button
          onClick={goToPreviousMonth}
          className="p-1 rounded transition-colors theme-transition"
          style={{ 
            color: 'var(--virpal-primary)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--virpal-accent-hover)';
            e.currentTarget.style.cursor = 'pointer';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--virpal-accent-active)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--virpal-accent-hover)';
          }}
        >
          ←
        </button>        <h3 className="font-semibold text-lg theme-transition" style={{ color: 'var(--virpal-neutral-default)' }}>
          {getMonthName(currentMonth)} {currentYear}
        </h3><button
          onClick={goToNextMonth}
          className="p-1 rounded transition-colors theme-transition"
          style={{ 
            color: 'var(--virpal-primary)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--virpal-accent-hover)';
            e.currentTarget.style.cursor = 'pointer';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--virpal-accent-active)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--virpal-accent-hover)';
          }}
        >
          →
        </button>
      </div>

      {/* Day headers */}      <div className="grid grid-cols-7 gap-1 mb-2 theme-transition">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium py-1 theme-transition" style={{ color: 'var(--virpal-neutral-dark)' }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 theme-transition">
        {calendarDays.map((calendarDay, index) => {
          const isCurrentMonth = calendarDay.date.getMonth() === currentMonth;
          
          return (            <button
              key={index}
              onClick={() => isCurrentMonth && onDateSelect(calendarDay.date)}
              disabled={!isCurrentMonth}              className={`
                relative h-8 w-8 text-xs rounded flex items-center justify-center transition-colors duration-200 theme-transition
                ${isCurrentMonth ? '' : 'cursor-default'}
                ${calendarDay.isSelected ? 'font-bold text-white' : ''}
                ${calendarDay.isToday && !calendarDay.isSelected ? 'font-bold' : ''}
              `}
              style={{
                backgroundColor: calendarDay.isSelected ? 'var(--virpal-primary)' : 'transparent',
                color: calendarDay.isSelected 
                  ? 'white' 
                  : calendarDay.isToday 
                    ? 'var(--virpal-primary)' 
                    : isCurrentMonth 
                      ? 'var(--virpal-neutral-default)' 
                      : 'var(--virpal-neutral-dark)',
                cursor: isCurrentMonth ? 'pointer' : 'default'
              }}
              onMouseEnter={(e) => {
                if (isCurrentMonth && !calendarDay.isSelected) {
                  e.currentTarget.style.backgroundColor = 'var(--virpal-accent-hover)';
                  e.currentTarget.style.cursor = 'pointer';
                } else if (!isCurrentMonth) {
                  e.currentTarget.style.cursor = 'default';
                }
              }}
              onMouseLeave={(e) => {
                if (isCurrentMonth && !calendarDay.isSelected) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              onMouseDown={(e) => {
                if (isCurrentMonth && !calendarDay.isSelected) {
                  e.currentTarget.style.backgroundColor = 'var(--virpal-accent-active)';
                }
              }}
              onMouseUp={(e) => {
                if (isCurrentMonth && !calendarDay.isSelected) {
                  e.currentTarget.style.backgroundColor = 'var(--virpal-accent-hover)';
                }
              }}
            >
              {calendarDay.date.getDate()}
              {calendarDay.hasHistory && (                <div
                  className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full theme-transition"
                  style={{ backgroundColor: 'var(--virpal-secondary)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;