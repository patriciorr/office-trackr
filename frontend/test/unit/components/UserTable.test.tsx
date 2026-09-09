import {describe, expect, it, vi} from 'vitest';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {renderWithProviders} from '../../utils/test-utils';
import {jsonResponse} from '../../utils/fetchMock';
import UserTable from '../../../src/components/UserTable';

const users = [
  {id: 'user-1', firstName: 'Alice', lastName: 'Anderson', email: 'alice@example.com', role: 'coworker'},
  {id: 'user-2', firstName: 'Bob', lastName: 'Brown', email: 'bob@example.com', role: 'manager'},
];

describe('UserTable', () => {
  it('shows a loading spinner while fetching', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));

    renderWithProviders(<UserTable onEdit={vi.fn()} onDelete={vi.fn()} onEditTeam={vi.fn()} refresh={0} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders fetched users in the table', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(users)));

    renderWithProviders(<UserTable onEdit={vi.fn()} onDelete={vi.fn()} onEditTeam={vi.fn()} refresh={0} />);

    await waitFor(() => expect(screen.getByText('alice@example.com')).toBeInTheDocument());
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/users?roles=coworker,manager',
      expect.any(Object)
    );
  });

  it('only shows the edit-team action for managers', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(users)));

    renderWithProviders(<UserTable onEdit={vi.fn()} onDelete={vi.fn()} onEditTeam={vi.fn()} refresh={0} />);
    await waitFor(() => expect(screen.getByText('alice@example.com')).toBeInTheDocument());

    expect(screen.getAllByLabelText('Editar equipo')).toHaveLength(1);
  });

  it('calls onEdit and onDelete with the selected user', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(users)));
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    renderWithProviders(<UserTable onEdit={onEdit} onDelete={onDelete} onEditTeam={vi.fn()} refresh={0} />);
    await waitFor(() => expect(screen.getByText('alice@example.com')).toBeInTheDocument());

    fireEvent.click(screen.getAllByLabelText('Editar usuario')[0]);
    fireEvent.click(screen.getAllByLabelText('Eliminar usuario')[0]);

    expect(onEdit).toHaveBeenCalledWith(users[0]);
    expect(onDelete).toHaveBeenCalledWith(users[0]);
  });

  it('refetches when the refresh prop changes', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(users));
    vi.stubGlobal('fetch', fetchMock);

    const {rerender} = renderWithProviders(
      <UserTable onEdit={vi.fn()} onDelete={vi.fn()} onEditTeam={vi.fn()} refresh={0} />
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    rerender(<UserTable onEdit={vi.fn()} onDelete={vi.fn()} onEditTeam={vi.fn()} refresh={1} />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
