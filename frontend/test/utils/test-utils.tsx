import React, {type PropsWithChildren, type ReactElement} from 'react';
import {render, type RenderOptions} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {ThemeProvider, createTheme} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {AuthContext} from '../../src/context/AuthContext';
import '../../src/locales/i18n';

export interface TestUser {
  id: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'coworker';
  team?: string[];
}

export const buildUser = (overrides: Partial<TestUser> = {}): TestUser => ({
  id: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  role: 'coworker',
  ...overrides,
});

const theme = createTheme();

interface WrapperOptions {
  user?: TestUser | null;
  setUser?: (user: TestUser | null) => void;
  updateUser?: (updates: Partial<TestUser>) => void;
  route?: string;
}

function Providers({
  children,
  user = null,
  setUser = () => {},
  updateUser = () => {},
  route = '/',
}: PropsWithChildren<WrapperOptions>) {
  return (
    <MemoryRouter initialEntries={[route]}>
      <AuthContext.Provider value={{user: user as any, setUser: setUser as any, updateUser}}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterDateFns}>{children}</LocalizationProvider>
        </ThemeProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options: WrapperOptions & Omit<RenderOptions, 'wrapper'> = {}
) {
  const {user, setUser, updateUser, route, ...renderOptions} = options;
  return render(ui, {
    wrapper: ({children}) => (
      <Providers user={user} setUser={setUser} updateUser={updateUser} route={route}>
        {children}
      </Providers>
    ),
    ...renderOptions,
  });
}

export * from '@testing-library/react';
