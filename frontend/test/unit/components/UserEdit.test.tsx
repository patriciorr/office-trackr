import {describe, expect, it, vi} from 'vitest';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {renderWithProviders, buildUser} from '../../utils/test-utils';
import {jsonResponse} from '../../utils/fetchMock';
import UserEdit from '../../../src/components/UserEdit';

const user = buildUser({id: 'user-1', firstName: 'John', lastName: 'Doe'});

describe('UserEdit', () => {
  it('pre-fills the name fields from the authenticated user', () => {
    renderWithProviders(<UserEdit />, {user});

    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
  });

  it('updates the name and shows a success message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({firstName: 'Jonathan', lastName: 'Doe'})));
    const updateUser = vi.fn();

    renderWithProviders(<UserEdit />, {user, updateUser});
    fireEvent.change(screen.getByLabelText(/Nombre/), {target: {value: 'Jonathan'}});
    fireEvent.click(screen.getByRole('button', {name: 'Cambiar nombre'}));

    await waitFor(() => expect(screen.getByText('Nombre actualizado correctamente')).toBeInTheDocument());
    expect(updateUser).toHaveBeenCalledWith({firstName: 'Jonathan', lastName: 'Doe'});
  });

  it('maps a first-name format error (FN003)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok: false, text: () => Promise.resolve('FN003 - invalid format')}));

    renderWithProviders(<UserEdit />, {user});
    fireEvent.click(screen.getByRole('button', {name: 'Cambiar nombre'}));

    await waitFor(() => expect(screen.getByText('El nombre solo debe contener letras')).toBeInTheDocument());
  });

  it('disables the password submit button when confirmation does not match', () => {
    renderWithProviders(<UserEdit />, {user});
    fireEvent.change(screen.getByLabelText('Antigua contraseña'), {target: {value: 'OldPassword1!'}});
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {target: {value: 'NewSecurePass9!'}});
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {target: {value: 'Mismatch1!'}});

    expect(screen.getByRole('button', {name: 'Cambiar contraseña'})).toBeDisabled();
  });

  it('maps an incorrect old password error (PW007) from the server', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({error: 'PW007 - Old password incorrect'}, {ok: false})));

    renderWithProviders(<UserEdit />, {user});
    fireEvent.change(screen.getByLabelText('Antigua contraseña'), {target: {value: 'WrongPassword1!'}});
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {target: {value: 'NewSecurePass9!'}});
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {target: {value: 'NewSecurePass9!'}});
    fireEvent.click(screen.getByRole('button', {name: 'Cambiar contraseña'}));

    await waitFor(() => expect(screen.getByText('La antigua contraseña es incorrecta')).toBeInTheDocument());
  });

  it('updates the password successfully and clears the fields', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({})));

    renderWithProviders(<UserEdit />, {user});
    fireEvent.change(screen.getByLabelText('Antigua contraseña'), {target: {value: 'OldPassword1!'}});
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {target: {value: 'NewSecurePass9!'}});
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {target: {value: 'NewSecurePass9!'}});
    fireEvent.click(screen.getByRole('button', {name: 'Cambiar contraseña'}));

    await waitFor(() => expect(screen.getByText('Contraseña actualizada correctamente')).toBeInTheDocument());
    expect((screen.getByLabelText('Antigua contraseña') as HTMLInputElement).value).toBe('');
  });
});
