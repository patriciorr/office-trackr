import {afterEach, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import App from '../../src/App';
import {AuthProvider} from '../../src/context/AuthContext';
import {mockFetchByRoute, buildJwt} from '../utils/fetchMock';
import '../../src/locales/i18n';

const renderApp = () => render(<AuthProvider><App /></AuthProvider>);

const validToken = () => buildJwt({id: 'user-1', role: 'coworker', exp: Math.floor(Date.now() / 1000) + 3600});

describe('App (integration)', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('hides registration when disabled for the deployment', () => {
    vi.stubEnv('VITE_DISABLE_REGISTRATION', 'true');
    renderApp();
    expect(screen.queryByText('¿No tienes cuenta? Regístrate')).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Entrar'})).toBeInTheDocument();
  });

  it('logs in and shows the calendar view', async () => {
    mockFetchByRoute({
      '/api/auth/login': {token: validToken(), user: {id: 'user-1', firstName: 'John', lastName: 'Doe', role: 'coworker'}},
      '/api/events': [],
    });

    renderApp();
    fireEvent.change(screen.getByLabelText(/Correo electrónico/), {target: {value: 'john@example.com'}});
    fireEvent.change(screen.getByLabelText(/Contraseña/), {target: {value: 'Password123!'}});
    fireEvent.click(screen.getByRole('button', {name: 'Entrar'}));

    await waitFor(() => expect(screen.getByText('Resumen mensual')).toBeInTheDocument());
    expect(window.localStorage.getItem('token')).not.toBeNull();
  });

  it('registers a new user and logs them in automatically', async () => {
    mockFetchByRoute({
      '/api/users/': {id: 'user-2'},
      '/api/auth/login': {token: validToken(), user: {id: 'user-2', firstName: 'Jane', lastName: 'Smith', role: 'coworker'}},
      '/api/events': [],
    });

    renderApp();
    fireEvent.click(screen.getByText('¿No tienes cuenta? Regístrate'));
    fireEvent.change(screen.getByLabelText(/Nombre/), {target: {value: 'Jane'}});
    fireEvent.change(screen.getByLabelText(/Apellido/), {target: {value: 'Smith'}});
    fireEvent.change(screen.getByLabelText(/Correo electrónico/), {target: {value: 'jane@example.com'}});
    fireEvent.change(screen.getByLabelText(/Contraseña/), {target: {value: 'StrongPass123!'}});
    fireEvent.click(screen.getByRole('button', {name: 'Registrarse'}));

    await waitFor(() => expect(screen.getByText('Resumen mensual')).toBeInTheDocument());
  });

  it('lets an admin reach the admin panel from the navbar', async () => {
    window.localStorage.setItem('token', validToken());
    window.localStorage.setItem('user', JSON.stringify({id: 'admin-1', firstName: 'Ada', lastName: 'Min', role: 'admin'}));
    mockFetchByRoute({'/api/events': [], '/api/users': []});

    renderApp();
    await waitFor(() => expect(screen.getByText('Resumen mensual')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', {name: 'Panel de Administración'}));

    await waitFor(() => expect(screen.getByText('Acciones')).toBeInTheDocument());
  });

  it('redirects a coworker away from the admin route', async () => {
    window.localStorage.setItem('token', validToken());
    window.localStorage.setItem('user', JSON.stringify({id: 'user-1', firstName: 'John', lastName: 'Doe', role: 'coworker'}));
    mockFetchByRoute({'/api/events': []});

    renderApp();

    await waitFor(() => expect(screen.getByText('Resumen mensual')).toBeInTheDocument());
    expect(screen.queryByRole('button', {name: 'Panel de Administración'})).not.toBeInTheDocument();
  });

  it('logs the user out when the token has expired', async () => {
    const expiredToken = buildJwt({id: 'user-1', role: 'coworker', exp: Math.floor(Date.now() / 1000) - 10});
    window.localStorage.setItem('token', expiredToken);
    window.localStorage.setItem('user', JSON.stringify({id: 'user-1', firstName: 'John', lastName: 'Doe', role: 'coworker'}));
    mockFetchByRoute({});

    renderApp();

    // Note: the expiry Snackbar lives only in the authenticated render branch, so once the
    // expired-token effect logs the user out it unmounts before that feedback can be seen.
    await waitFor(() => expect(screen.getByRole('button', {name: 'Entrar'})).toBeInTheDocument());
    expect(window.localStorage.getItem('token')).toBeNull();
  });
});
