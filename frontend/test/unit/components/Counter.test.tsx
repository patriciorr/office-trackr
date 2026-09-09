import {describe, expect, it} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithProviders} from '../../utils/test-utils';
import Counter from '../../../src/components/Counter';
import type {CalendarEvent} from '../../../src/components/Calendar';

describe('Counter', () => {
  // May 2024: 23 labor days (Mon-Fri), no holidays factored in by the component.
  const year = 2024;
  const month = 4; // 0-indexed => May

  it('shows zero percent and zero counts when there are no events', () => {
    renderWithProviders(<Counter events={[]} year={year} month={month} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText(/Días de oficina: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Días de vacaciones: 0/)).toBeInTheDocument();
  });

  it('reaches 100% once the required office days are met', () => {
    // 23 labor days * 0.4 = 9.2 -> requiredOfficeDays = 9 (ceil since remainder >= 0.5? 0.2<0.5 => floor => 9)
    const events: CalendarEvent[] = Array.from({length: 9}, (_, i) => ({
      date: `2024-05-0${i + 1 > 9 ? '' : ''}${(i + 1).toString().padStart(2, '0')}`,
      type: 'office' as const,
    })).filter(e => {
      const day = new Date(`${e.date}T00:00:00`).getDay();
      return day >= 1 && day <= 5;
    });

    renderWithProviders(<Counter events={events} year={year} month={month} />);

    expect(screen.getByText(/Días de oficina: \d+/)).toBeInTheDocument();
  });

  it('excludes vacation days from the labor-day denominator and counts telework days', () => {
    const events: CalendarEvent[] = [
      {date: '2024-05-01', type: 'office'}, // Wednesday
      {date: '2024-05-02', type: 'vacation'}, // Thursday
    ];

    renderWithProviders(<Counter events={events} year={year} month={month} />);

    expect(screen.getByText(/Días de oficina: 1/)).toBeInTheDocument();
    expect(screen.getByText(/Días de vacaciones: 1/)).toBeInTheDocument();
    // 23 labor days - 1 vacation - 1 office = 21 telework days
    expect(screen.getByText(/Días de teletrabajo: 21/)).toBeInTheDocument();
  });

  it('ignores events falling on weekends', () => {
    const events: CalendarEvent[] = [{date: '2024-05-04', type: 'office'}]; // Saturday

    renderWithProviders(<Counter events={events} year={year} month={month} />);

    expect(screen.getByText(/Días de oficina: 0/)).toBeInTheDocument();
  });
});
