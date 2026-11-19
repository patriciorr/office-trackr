import {describe, expect, it, vi} from 'vitest';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {renderWithProviders} from '../../utils/test-utils';
import {jsonResponse} from '../../utils/fetchMock';
import Login from '../../../src/components/Login';
import i18n from '../../../src/locales/i18n';

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
  it('shows a translated message when a network request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    renderWithProviders(<Login {...baseProps} onLogin={vi.fn()} />);
    fillForm('john@example.com', 'Password123!');
    fireEvent.click(screen.getByRole('button', {name: 'Entrar'}));

    await waitFor(() => expect(screen.getByRole('alert'))
      .toHaveTextContent('No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.'));
  });

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
      '/api/auth/login',
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

  it('shows a translated fallback for unmapped server errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({error: 'Network exploded'}, {ok: false})));

    renderWithProviders(<Login {...baseProps} onLogin={vi.fn()} />);
    fillForm('john@example.com', 'Password123!');
    fireEvent.click(screen.getByRole('button', {name: 'Entrar'}));

    await waitFor(() => expect(screen.getByText('Error al iniciar sesión')).toBeInTheDocument());
    expect(screen.queryByText('Network exploded')).not.toBeInTheDocument();
  });

  it('updates an existing network error in all supported languages', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    renderWithProviders(<Login {...baseProps} onLogin={vi.fn()} />);
    fillForm('john@example.com', 'Password123!');
    fireEvent.click(screen.getByRole('button', {name: 'Entrar'}));

    await screen.findByText('No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.');
    try {
      for (const [language, message] of [
        ['en', 'Could not connect to the server. Check your connection and try again.'],
        ['fr', 'Impossible de se connecter au serveur. Vérifiez votre connexion et réessayez.'],
        ['pt', 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'],
      ]) {
        await i18n.changeLanguage(language);
        expect(await screen.findByText(message)).toBeInTheDocument();
      }
    } finally {
      await i18n.changeLanguage('es');
    }
  });
});
