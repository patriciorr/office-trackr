import {describe, expect, it, vi} from 'vitest';
import {fireEvent, screen} from '@testing-library/react';
import {renderWithProviders} from '../../utils/test-utils';
import Calendar from '../../../src/components/Calendar';
import type {CalendarEvent} from '../../../src/components/Calendar';

describe('Calendar', () => {
  const events: CalendarEvent[] = [{date: new Date().toISOString().slice(0, 10), type: 'office'}];

  it('renders the calendar heading', () => {
    renderWithProviders(<Calendar events={events} onSelectDay={() => {}} />);

    expect(screen.getByText('Calendario')).toBeInTheDocument();
  });

  it('calls onSelectDay when a day is picked', () => {
    const onSelectDay = vi.fn();
    renderWithProviders(<Calendar events={events} onSelectDay={onSelectDay} />);

    const today = new Date();
    const dayButton = screen.getByRole('gridcell', {name: String(today.getDate())});
    fireEvent.click(dayButton);

    expect(onSelectDay).toHaveBeenCalledTimes(1);
    const calledWith = onSelectDay.mock.calls[0][0] as Date;
    expect(calledWith.getDate()).toBe(today.getDate());
  });

  it('calls onMonthChange when navigating to the next month', () => {
    const onMonthChange = vi.fn();
    renderWithProviders(<Calendar events={events} onSelectDay={() => {}} onMonthChange={onMonthChange} />);

    fireEvent.click(screen.getByLabelText('Next month'));

    expect(onMonthChange).toHaveBeenCalledTimes(1);
  });
});
