import {describe, expect, it, vi} from 'vitest';
import {fireEvent, screen} from '@testing-library/react';
import {renderWithProviders} from '../../utils/test-utils';
import DayEventModal from '../../../src/components/DayEventModal';

describe('DayEventModal', () => {
  it('shows the "add" title and no delete button when there is no existing event', () => {
    renderWithProviders(<DayEventModal date="2024-05-15" onSave={() => {}} onClose={() => {}} />);

    expect(screen.getByText(/Agregar evento/)).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Eliminar'})).not.toBeInTheDocument();
  });

  it('shows the "edit" title and a delete button when editing an existing event', () => {
    renderWithProviders(
      <DayEventModal
        date="2024-05-15"
        event={{id: 'event-1', date: '2024-05-15', type: 'office'}}
        onSave={() => {}}
        onDelete={() => {}}
        onClose={() => {}}
      />
    );

    expect(screen.getByText(/Editar evento/)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Eliminar'})).toBeInTheDocument();
  });

  it('calls onSave with the office type when the office button is clicked', () => {
    const onSave = vi.fn();
    renderWithProviders(<DayEventModal date="2024-05-15" onSave={onSave} onClose={() => {}} />);

    fireEvent.click(screen.getByRole('button', {name: 'Oficina'}));

    expect(onSave).toHaveBeenCalledWith({date: '2024-05-15', type: 'office'});
  });

  it('calls onSave with the vacation type when the vacation button is clicked', () => {
    const onSave = vi.fn();
    renderWithProviders(<DayEventModal date="2024-05-15" onSave={onSave} onClose={() => {}} />);

    fireEvent.click(screen.getByRole('button', {name: 'Vacaciones'}));

    expect(onSave).toHaveBeenCalledWith({date: '2024-05-15', type: 'vacation'});
  });

  it('calls onDelete with the event when the delete button is clicked', () => {
    const onDelete = vi.fn();
    const event = {id: 'event-1', date: '2024-05-15', type: 'office' as const};
    renderWithProviders(<DayEventModal date="2024-05-15" event={event} onSave={() => {}} onDelete={onDelete} onClose={() => {}} />);

    fireEvent.click(screen.getByRole('button', {name: 'Eliminar'}));

    expect(onDelete).toHaveBeenCalledWith(event);
  });

  it('calls onClose when cancel is clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(<DayEventModal date="2024-05-15" onSave={() => {}} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', {name: 'Cancelar'}));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
