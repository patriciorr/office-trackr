import {describe, expect, it, vi} from 'vitest';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {renderWithProviders} from '../../utils/test-utils';
import {jsonResponse} from '../../utils/fetchMock';
import ConfirmDeleteDialog from '../../../src/components/ConfirmDeleteDialog';

const user = {id: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@example.com'};

describe('ConfirmDeleteDialog', () => {
  it('shows the confirmation message with the user name', () => {
    renderWithProviders(<ConfirmDeleteDialog user={user} onClose={() => {}} />);

    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked without deleting', () => {
    const onClose = vi.fn();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(<ConfirmDeleteDialog user={user} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', {name: 'Cancelar'}));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('deletes the user and calls onDeleted then onClose on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, {status: 204})));
    window.localStorage.setItem('token', 'test-token');
    const onClose = vi.fn();
    const onDeleted = vi.fn();

    renderWithProviders(<ConfirmDeleteDialog user={user} onClose={onClose} onDeleted={onDeleted} />);
    fireEvent.click(screen.getByRole('button', {name: 'Eliminar'}));

    await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/users/user-1',
      expect.objectContaining({method: 'DELETE', headers: {Authorization: 'Bearer test-token'}})
    );
  });

  it('shows an error message and keeps the dialog open on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({error: 'failed'}, {ok: false, status: 500})));
    const onClose = vi.fn();

    renderWithProviders(<ConfirmDeleteDialog user={user} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', {name: 'Eliminar'}));

    await waitFor(() => expect(screen.getByText('Error al eliminar el usuario')).toBeInTheDocument());
    expect(onClose).not.toHaveBeenCalled();
  });
});
