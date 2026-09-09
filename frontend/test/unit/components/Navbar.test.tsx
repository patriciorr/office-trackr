import {describe, expect, it, vi} from 'vitest';
import {fireEvent, screen} from '@testing-library/react';
import {renderWithProviders, buildUser} from '../../utils/test-utils';
import Navbar from '../../../src/components/Navbar';

const baseProps = {
  isDarkMode: false,
  onToggleDarkMode: vi.fn(),
  language: 'es' as const,
  onLanguageChange: vi.fn(),
};

describe('Navbar', () => {
  it('only shows the calendar tab for a coworker', () => {
    renderWithProviders(<Navbar {...baseProps} role="coworker" />, {user: buildUser({role: 'coworker'})});

    expect(screen.getByRole('button', {name: 'Calendario'})).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Panel de Manager'})).not.toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Panel de Administración'})).not.toBeInTheDocument();
  });

  it('shows the dashboard tab for a manager', () => {
    renderWithProviders(<Navbar {...baseProps} role="manager" />, {user: buildUser({role: 'manager'})});

    expect(screen.getByRole('button', {name: 'Panel de Manager'})).toBeInTheDocument();
  });

  it('shows the admin tab for an admin', () => {
    renderWithProviders(<Navbar {...baseProps} role="admin" />, {user: buildUser({role: 'admin'})});

    expect(screen.getByRole('button', {name: 'Panel de Administración'})).toBeInTheDocument();
  });

  it('calls onToggleDarkMode when the theme icon is clicked', () => {
    const onToggleDarkMode = vi.fn();
    renderWithProviders(<Navbar {...baseProps} onToggleDarkMode={onToggleDarkMode} role="coworker" />, {
      user: buildUser(),
    });

    fireEvent.click(screen.getByLabelText('Modo oscuro'));

    expect(onToggleDarkMode).toHaveBeenCalledTimes(1);
  });

  it('calls onTabChange when a tab is clicked', () => {
    const onTabChange = vi.fn();
    renderWithProviders(<Navbar {...baseProps} role="manager" onTabChange={onTabChange} />, {
      user: buildUser({role: 'manager'}),
    });

    fireEvent.click(screen.getByRole('button', {name: 'Panel de Manager'}));

    expect(onTabChange).toHaveBeenCalledWith('dashboard');
  });

  it('calls onLogout and navigates when logout is selected from the user menu', () => {
    const onLogout = vi.fn();
    renderWithProviders(<Navbar {...baseProps} role="coworker" onLogout={onLogout} />, {user: buildUser()});

    fireEvent.click(screen.getByLabelText('Editar usuario'));
    fireEvent.click(screen.getByText('Cerrar sesión'));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('does not render the user menu when there is no authenticated user', () => {
    renderWithProviders(<Navbar {...baseProps} role="coworker" />, {user: null});

    expect(screen.queryByLabelText('Editar usuario')).not.toBeInTheDocument();
  });

  it('hides the tabs entirely in minimal mode', () => {
    renderWithProviders(<Navbar {...baseProps} minimal />, {user: null});

    expect(screen.queryByRole('button', {name: 'Calendario'})).not.toBeInTheDocument();
  });
});
