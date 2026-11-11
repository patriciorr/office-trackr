import {describe, expect, it, vi} from 'vitest';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {renderWithProviders} from '../../utils/test-utils';
import {jsonResponse} from '../../utils/fetchMock';
import UserEditModal from '../../../src/components/UserEditModal';

const user = {id: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'coworker'};

describe('UserEditModal', () => {
  it('pre-fills the fields with the current user data', () => {
    renderWithProviders(<UserEditModal user={user} onClose={() => {}} />);

    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
  });

  it('saves the updated name and calls onSaved then onClose', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(user)));
    window.localStorage.setItem('token', 'test-token');
    const onClose = vi.fn();
    const onSaved = vi.fn();

    renderWithProviders(<UserEditModal user={user} onClose={onClose} onSaved={onSaved} />);
    fireEvent.change(screen.getByLabelText('Nombre'), {target: {value: 'Jonathan'}});
    fireEvent.click(screen.getByRole('button', {name: 'Guardar'}));

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      '/api/users/user-1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({firstName: 'Jonathan', lastName: 'Doe'}),
        headers: {'Content-Type': 'application/json', Authorization: 'Bearer test-token'},
      })
    );
  });

  it('shows an error and keeps the modal open on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, {ok: false, status: 500})));
    const onClose = vi.fn();

    renderWithProviders(<UserEditModal user={user} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', {name: 'Guardar'}));

    await waitFor(() => expect(screen.getByText('Error al actualizar el nombre')).toBeInTheDocument());
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when cancel is clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(<UserEditModal user={user} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', {name: 'Cancelar'}));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
