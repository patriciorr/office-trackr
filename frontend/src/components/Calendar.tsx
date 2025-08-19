import React, { JSX, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface CalendarEvent {
  _id?: string;
  date: string; // YYYY-MM-DD
  type: CalendarEventType;
}

interface CalendarProps {
  events: CalendarEvent[];
  onDayClick: (date: string) => void;
  isDarkMode?: boolean;
}

// Tipos para los días y eventos
export type CalendarEventType = 'office' | 'vacation';

export interface CalendarEvent {
  _id?: string;
  date: string; // YYYY-MM-DD
  type: CalendarEventType;
}

// Utilidad para obtener los días del mes
function getDaysInMonth(year: number, month: number) {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

const Calendar: React.FC<CalendarProps> = ({ events, onDayClick, isDarkMode = false }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const days = getDaysInMonth(currentYear, currentMonth);

  // Mapeo de eventos por fecha
  const eventMap = events.reduce((acc, ev) => {
    acc[ev.date] = ev;
    return acc;
  }, {} as Record<string, CalendarEvent>);

  // Navegación de meses
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const { t } = useTranslation();
  const months = t('months', { returnObjects: true }) as string[];
  const daysOfWeek = t('days', { returnObjects: true }) as string[];
  const monthName = months[currentMonth];
  return (
  <div style={{ background: isDarkMode ? '#232946' : '#fff', color: isDarkMode ? '#eaf0fa' : '#232946', borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={prevMonth}>{'<'}</button>
        <h3>{monthName} {currentYear}</h3>
        <button onClick={nextMonth}>{'>'}</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {daysOfWeek.map(d => <th key={d}>{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {/* Renderizar las semanas */}
          {(() => {
            const weeks: JSX.Element[] = [];
            let week: JSX.Element[] = [];
            let dayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Lunes=0
            for (let i = 0; i < dayOfWeek; i++) week.push(<td key={'empty-' + i}></td>);
            days.forEach((date, idx) => {
              const dateStr = date.toISOString().slice(0, 10);
              const event = eventMap[dateStr];
              week.push(
                <td
                  key={dateStr}
                  style={{ border: '1px solid #ccc', cursor: 'pointer', background: event ? (event.type === 'office' ? '#d1e7dd' : event.type === 'vacation' ? '#f8d7da' : '#cff4fc') : undefined }}
                  title={event ? t(event.type) : ''}
                  onClick={() => onDayClick(dateStr)}
                >
                  {date.getDate()}
                </td>
              );
              if ((week.length === 7) || (idx === days.length - 1)) {
                weeks.push(<tr key={'week-' + weeks.length}>{week}</tr>);
                week = [];
              }
            });
            return weeks;
          })()}
        </tbody>
      </table>
    </div>
  );
};

  export default Calendar;
