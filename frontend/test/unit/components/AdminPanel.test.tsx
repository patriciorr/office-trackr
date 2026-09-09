import {describe, expect, it, vi} from 'vitest';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {renderWithProviders} from '../../utils/test-utils';
import AdminPanel from '../../../src/components/AdminPanel';
import type {User} from '../../../src/components/UserTable';

const testUser: User = {id: 'user-1', firstName: 'Alice', lastName: 'Anderson', email: 'alice@example.com', role: 'coworker'};

vi.mock('../../../src/components/UserTable', () => ({
  default: ({onEdit, onDelete, onEditTeam, refresh}: any) => (
    <div>
      <span data-testid="refresh-value">{refresh}</span>
      <button onClick={() => onEdit(testUser)}>trigger-edit</button>
      <button onClick={() => onDelete(testUser)}>trigger-delete</button>
      <button onClick={() => onEditTeam(testUser)}>trigger-edit-team</button>
    </div>
  ),
}));
vi.mock('../../../src/components/UserEditModal', () => ({
  default: ({onSaved}: any) => <button onClick={onSaved}>save-edit</button>,
}));
vi.mock('../../../src/components/ConfirmDeleteDialog', () => ({
  default: ({onDeleted}: any) => <button onClick={onDeleted}>confirm-delete</button>,
}));
vi.mock('../../../src/components/TeamEditModal', () => ({
  default: ({onSaved}: any) => <button onClick={onSaved}>save-team</button>,
}));

describe('AdminPanel', () => {
  it('renders the admin panel title and the user table', () => {
    renderWithProviders(<AdminPanel />);

    expect(screen.getByText('Panel de Administración')).toBeInTheDocument();
    expect(screen.getByTestId('refresh-value')).toHaveTextContent('0');
  });

  it('opens the edit modal and bumps the refresh counter once saved', async () => {
    renderWithProviders(<AdminPanel />);

    fireEvent.click(screen.getByText('trigger-edit'));
    expect(screen.getByText('save-edit')).toBeInTheDocument();

    fireEvent.click(screen.getByText('save-edit'));

    await waitFor(() => expect(screen.getByTestId('refresh-value')).toHaveTextContent('1'));
    expect(screen.queryByText('save-edit')).not.toBeInTheDocument();
  });

  it('opens the delete dialog and bumps the refresh counter once deleted', async () => {
    renderWithProviders(<AdminPanel />);

    fireEvent.click(screen.getByText('trigger-delete'));
    fireEvent.click(screen.getByText('confirm-delete'));

    await waitFor(() => expect(screen.getByTestId('refresh-value')).toHaveTextContent('1'));
  });

  it('opens the team modal and bumps the refresh counter once saved', async () => {
    renderWithProviders(<AdminPanel />);

    fireEvent.click(screen.getByText('trigger-edit-team'));
    fireEvent.click(screen.getByText('save-team'));

    await waitFor(() => expect(screen.getByTestId('refresh-value')).toHaveTextContent('1'));
  });
});
