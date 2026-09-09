import {describe, expect, it, vi} from 'vitest';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {renderWithProviders} from '../../utils/test-utils';
import {jsonResponse} from '../../utils/fetchMock';
import Login from '../../../src/components/Login';

const baseProps = {
  language: 'es' as const,
  onLanguageChange: vi.fn(),
  onToggleDarkMode: vi.fn(),
};

const fillForm = (email: string, password: string) => {
  fireEvent.change(screen.getByLabelText(/Correo electrónico/), {target: {value: email}});
  fireEvent.change(screen.getByLabelText(/Contraseña/), {target: {value: password}});
};

describe('Login', () => {
  it('calls onLogin with the token and user on success', async () => {
    const onLogin = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({token: 'jwt-token', user: {id: 'user-1', role: 'coworker'}}))
    );

    renderWithProviders(<Login {...baseProps} onLogin={onLogin} />);
    fillForm('john@example.com', 'Password123!');
    fireEvent.click(screen.getByRole('button', {name: 'Entrar'}));

    await waitFor(() => expect(onLogin).toHaveBeenCalledWith('jwt-token', {id: 'user-1', role: 'coworker'}));
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/auth/login',
      expect.objectContaining({method: 'POST'})
    );
  });

  it('shows a user-not-found message for AUTH001 errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({error: 'AUTH001 - User not found'}, {ok: false})));

    renderWithProviders(<Login {...baseProps} onLogin={vi.fn()} />);
    fillForm('missing@example.com', 'Password123!');
    fireEvent.click(screen.getByRole('button', {name: 'Entrar'}));

    await waitFor(() => expect(screen.getByText('Usuario no encontrado')).toBeInTheDocument());
  });

  it('shows an invalid-credentials message for AUTH002 errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({error: 'AUTH002 - Invalid credentials'}, {ok: false}))
    );

    renderWithProviders(<Login {...baseProps} onLogin={vi.fn()} />);
    fillForm('john@example.com', 'WrongPassword1!');
    fireEvent.click(screen.getByRole('button', {name: 'Entrar'}));

    await waitFor(() => expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument());
  });

  it('shows the raw error message for unmapped errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({error: 'Network exploded'}, {ok: false})));

    renderWithProviders(<Login {...baseProps} onLogin={vi.fn()} />);
    fillForm('john@example.com', 'Password123!');
    fireEvent.click(screen.getByRole('button', {name: 'Entrar'}));

    await waitFor(() => expect(screen.getByText('Network exploded')).toBeInTheDocument());
  });
});
