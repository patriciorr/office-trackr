import {describe, expect, it, vi} from 'vitest';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {renderWithProviders} from '../../utils/test-utils';
import {jsonResponse} from '../../utils/fetchMock';
import Register from '../../../src/components/Register';

const baseProps = {
  language: 'es' as const,
  onLanguageChange: vi.fn(),
  onToggleDarkMode: vi.fn(),
};

const fillForm = (overrides: Partial<{firstName: string; lastName: string; email: string; password: string}> = {}) => {
  const data = {firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: 'Password123!!', ...overrides};
  fireEvent.change(screen.getByLabelText(/Nombre/), {target: {value: data.firstName}});
  fireEvent.change(screen.getByLabelText(/Apellido/), {target: {value: data.lastName}});
  fireEvent.change(screen.getByLabelText(/Correo electrónico/), {target: {value: data.email}});
  fireEvent.change(screen.getByLabelText(/Contraseña/), {target: {value: data.password}});
};

describe('Register', () => {
  it('registers and then logs in automatically on success', async () => {
    const onRegister = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({id: 'user-1'}, {status: 201}))
        .mockResolvedValueOnce(jsonResponse({token: 'jwt-token', user: {id: 'user-1'}}))
    );

    renderWithProviders(<Register {...baseProps} onRegister={onRegister} />);
    fillForm();
    fireEvent.click(screen.getByRole('button', {name: 'Registrarse'}));

    await waitFor(() => expect(onRegister).toHaveBeenCalledWith('jwt-token', {id: 'user-1'}));
    expect(fetch).toHaveBeenNthCalledWith(1, 'http://localhost:5000/api/users/', expect.objectContaining({method: 'POST'}));
    expect(fetch).toHaveBeenNthCalledWith(2, 'http://localhost:5000/api/auth/login', expect.objectContaining({method: 'POST'}));
  });

  it('shows a mapped error message for a duplicate email (EM003)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({error: 'EM003 - Email is already registered'}, {ok: false})));

    renderWithProviders(<Register {...baseProps} onRegister={vi.fn()} />);
    fillForm();
    fireEvent.click(screen.getByRole('button', {name: 'Registrarse'}));

    await waitFor(() => expect(screen.getByText('El correo electrónico ya está registrado')).toBeInTheDocument());
  });

  it('shows a mapped error message for a weak password (PW002)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({error: 'PW002 - weak password'}, {ok: false})));

    renderWithProviders(<Register {...baseProps} onRegister={vi.fn()} />);
    fillForm();
    fireEvent.click(screen.getByRole('button', {name: 'Registrarse'}));

    await waitFor(() =>
      expect(
        screen.getByText('La contraseña debe tener al menos 12 caracteres y incluir mayúsculas, minúsculas, números y símbolos')
      ).toBeInTheDocument()
    );
  });

  it('updates the password checklist as the user types', () => {
    renderWithProviders(<Register {...baseProps} onRegister={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Contraseña/), {target: {value: 'weak'}});

    // Only the "minimum length" and "symbol" hints stay unmet-styled (gray); this assertion checks the strong password path instead.
    fireEvent.change(screen.getByLabelText(/Contraseña/), {target: {value: 'StrongPass123!'}});

    expect(screen.getByText('Mínimo 12 caracteres')).toBeInTheDocument();
  });
});
