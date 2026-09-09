import {describe, expect, it, vi} from 'vitest';
import {fireEvent, screen} from '@testing-library/react';
import {renderWithProviders} from '../../utils/test-utils';
import DayEventPanel from '../../../src/components/DayEventPanel';

describe('DayEventPanel', () => {
  it('shows the "add" title when there is no existing event', () => {
    renderWithProviders(<DayEventPanel date="2024-05-15" onSave={() => {}} />);

    expect(screen.getByText(/Agregar evento/)).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Eliminar'})).not.toBeInTheDocument();
  });

  it('shows the "edit" title and delete button for an existing event', () => {
    renderWithProviders(
      <DayEventPanel
        date="2024-05-15"
        event={{id: 'event-1', date: '2024-05-15', type: 'vacation'}}
        onSave={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.getByText(/Editar evento/)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Eliminar'})).toBeInTheDocument();
  });

  it('calls onSave with the office type when clicked', () => {
    const onSave = vi.fn();
    renderWithProviders(<DayEventPanel date="2024-05-15" onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', {name: 'Oficina'}));

    expect(onSave).toHaveBeenCalledWith({date: '2024-05-15', type: 'office'});
  });

  it('calls onDelete with the current event', () => {
    const onDelete = vi.fn();
    const event = {id: 'event-1', date: '2024-05-15', type: 'office' as const};
    renderWithProviders(<DayEventPanel date="2024-05-15" event={event} onSave={() => {}} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole('button', {name: 'Eliminar'}));

    expect(onDelete).toHaveBeenCalledWith(event);
  });

  it('resets the selected type when the event prop changes', () => {
    const {rerender} = renderWithProviders(
      <DayEventPanel date="2024-05-15" event={{id: '1', date: '2024-05-15', type: 'office'}} onSave={() => {}} onDelete={() => {}} />
    );
    expect(screen.getByRole('button', {name: 'Oficina'})).toHaveClass('MuiButton-contained');

    rerender(<DayEventPanel date="2024-05-16" event={undefined} onSave={() => {}} />);

    expect(screen.getByRole('button', {name: 'Oficina'})).toHaveClass('MuiButton-outlined');
  });
});
