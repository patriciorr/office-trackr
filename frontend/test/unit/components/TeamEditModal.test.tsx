import {describe, expect, it, vi} from 'vitest';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {renderWithProviders} from '../../utils/test-utils';
import {jsonResponse} from '../../utils/fetchMock';
import TeamEditModal from '../../../src/components/TeamEditModal';

const manager = {id: 'manager-1', firstName: 'Mia', lastName: 'Manager', team: ['coworker-1']};
const coworkers = [
  {id: 'coworker-1', firstName: 'Alice', lastName: 'Anderson'},
  {id: 'coworker-2', firstName: 'Bob', lastName: 'Brown'},
];

describe('TeamEditModal', () => {
  it('shows a loading indicator while fetching coworkers', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));

    renderWithProviders(<TeamEditModal user={manager} onClose={() => {}} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('pre-selects the current team members once loaded', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(coworkers)));

    renderWithProviders(<TeamEditModal user={manager} onClose={() => {}} />);

    await waitFor(() => expect(screen.getByText('Alice Anderson')).toBeInTheDocument());
  });

  it('saves the selected team and calls onSaved then onClose', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(jsonResponse(coworkers)).mockResolvedValueOnce(jsonResponse({}))
    );
    window.localStorage.setItem('token', 'test-token');
    const onClose = vi.fn();
    const onSaved = vi.fn();

    renderWithProviders(<TeamEditModal user={manager} onClose={onClose} onSaved={onSaved} />);
    await waitFor(() => expect(screen.getByText('Alice Anderson')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', {name: 'Guardar'}));

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'http://localhost:5000/api/users/manager-1',
      expect.objectContaining({method: 'PATCH', body: JSON.stringify({team: ['coworker-1']})})
    );
  });

  it('shows an error when saving fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(jsonResponse(coworkers)).mockResolvedValueOnce(jsonResponse({}, {ok: false}))
    );

    renderWithProviders(<TeamEditModal user={manager} onClose={() => {}} />);
    await waitFor(() => expect(screen.getByText('Alice Anderson')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', {name: 'Guardar'}));

    await waitFor(() => expect(screen.getByText('Error al actualizar el equipo')).toBeInTheDocument());
  });
});
