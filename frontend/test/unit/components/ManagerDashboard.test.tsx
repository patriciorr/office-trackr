import {describe, expect, it, vi} from 'vitest';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {renderWithProviders, buildUser} from '../../utils/test-utils';
import {jsonResponse} from '../../utils/fetchMock';
import ManagerDashboard from '../../../src/components/ManagerDashboard';

const manager = buildUser({id: 'manager-1', role: 'manager', team: ['coworker-1']});

const routeFetch = (routes: Record<string, unknown>) =>
  vi.fn((url: string, init?: RequestInit) => {
    if (init?.method === 'PATCH') {
      return Promise.resolve(jsonResponse(routes['PATCH']));
    }
    const match = Object.keys(routes).find(key => key !== 'PATCH' && url.includes(key));
    return Promise.resolve(jsonResponse(match ? routes[match] : []));
  });

describe('ManagerDashboard', () => {
  it('renders each team member with their office and vacation day counts', async () => {
    vi.stubGlobal(
      'fetch',
      routeFetch({
        '/api/users?ids=coworker-1': [{id: 'coworker-1', firstName: 'Alice', lastName: 'Anderson'}],
        '/api/events?userId=coworker-1': [
          {type: 'office'},
          {type: 'office'},
          {type: 'vacation'},
        ],
        '/api/users?roles=coworker': [{id: 'coworker-1', firstName: 'Alice', lastName: 'Anderson'}],
      })
    );

    renderWithProviders(<ManagerDashboard />, {user: manager});

    await waitFor(() => expect(screen.getByText('Alice Anderson')).toBeInTheDocument());
    expect(await screen.findByText(/Días de oficina:\s*2/)).toBeInTheDocument();
    expect(screen.getByText(/Días de vacaciones:\s*1/)).toBeInTheDocument();
  });

  it('shows the add-coworker button when there are unassigned coworkers', async () => {
    vi.stubGlobal(
      'fetch',
      routeFetch({
        '/api/users?ids=coworker-1': [{id: 'coworker-1', firstName: 'Alice', lastName: 'Anderson'}],
        '/api/events?userId=coworker-1': [],
        '/api/users?roles=coworker': [
          {id: 'coworker-1', firstName: 'Alice', lastName: 'Anderson'},
          {id: 'coworker-2', firstName: 'Bob', lastName: 'Brown'},
        ],
      })
    );

    renderWithProviders(<ManagerDashboard />, {user: manager});

    await waitFor(() => expect(screen.getByRole('button', {name: /Añadir trabajador/})).toBeInTheDocument());
  });

  it('removes a coworker and updates the authenticated user', async () => {
    const fetchMock = routeFetch({
      '/api/users?ids=coworker-1': [{id: 'coworker-1', firstName: 'Alice', lastName: 'Anderson'}],
      '/api/events?userId=coworker-1': [],
      '/api/users?roles=coworker': [{id: 'coworker-1', firstName: 'Alice', lastName: 'Anderson'}],
      PATCH: {...manager, team: []},
    });
    vi.stubGlobal('fetch', fetchMock);
    const setUser = vi.fn();

    renderWithProviders(<ManagerDashboard />, {user: manager, setUser});
    await waitFor(() => expect(screen.getByText('Alice Anderson')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('CloseIcon').closest('button')!);

    await waitFor(() => expect(setUser).toHaveBeenCalledWith({...manager, team: []}));
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/users/manager-1',
      expect.objectContaining({method: 'PATCH', body: JSON.stringify({team: []})})
    );
  });

  it('adds selected coworkers to the team from the modal', async () => {
    const fetchMock = routeFetch({
      '/api/users?ids=coworker-1': [{id: 'coworker-1', firstName: 'Alice', lastName: 'Anderson'}],
      '/api/events?userId=coworker-1': [],
      '/api/users?roles=coworker': [
        {id: 'coworker-1', firstName: 'Alice', lastName: 'Anderson'},
        {id: 'coworker-2', firstName: 'Bob', lastName: 'Brown'},
      ],
      PATCH: {...manager, team: ['coworker-1', 'coworker-2']},
    });
    vi.stubGlobal('fetch', fetchMock);
    const setUser = vi.fn();

    renderWithProviders(<ManagerDashboard />, {user: manager, setUser});
    await waitFor(() => expect(screen.getByRole('button', {name: /Añadir trabajador/})).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', {name: /Añadir trabajador/}));
    fireEvent.mouseDown(screen.getByLabelText('Trabajadores'));
    fireEvent.click(await screen.findByText('Bob Brown'));
    fireEvent.click(screen.getByRole('button', {name: 'Confirmar'}));

    await waitFor(() => expect(setUser).toHaveBeenCalledWith({...manager, team: ['coworker-1', 'coworker-2']}));
  });
});
