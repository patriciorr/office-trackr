import {describe, expect, it} from 'vitest';
import {act, renderHook} from '@testing-library/react';
import {useContext} from 'react';
import {AuthContext, AuthProvider} from '../../../src/context/AuthContext';

const wrapper = ({children}: {children: React.ReactNode}) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  it('starts with no authenticated user', () => {
    const {result} = renderHook(() => useContext(AuthContext), {wrapper});

    expect(result.current.user).toBeNull();
  });

  it('persists the user to localStorage when set', () => {
    const {result} = renderHook(() => useContext(AuthContext), {wrapper});

    act(() => result.current.setUser({id: 'user-1', firstName: 'John', lastName: 'Doe', role: 'coworker'}));

    expect(result.current.user?.firstName).toBe('John');
    expect(JSON.parse(window.localStorage.getItem('user')!)).toMatchObject({firstName: 'John'});
  });

  it('removes the user from localStorage when cleared', () => {
    const {result} = renderHook(() => useContext(AuthContext), {wrapper});

    act(() => result.current.setUser({id: 'user-1', firstName: 'John', lastName: 'Doe', role: 'coworker'}));
    act(() => result.current.setUser(null));

    expect(window.localStorage.getItem('user')).toBeNull();
  });

  it('merges partial updates via updateUser', () => {
    const {result} = renderHook(() => useContext(AuthContext), {wrapper});

    act(() => result.current.setUser({id: 'user-1', firstName: 'John', lastName: 'Doe', role: 'coworker'}));
    act(() => result.current.updateUser({firstName: 'Jonathan'}));

    expect(result.current.user).toMatchObject({firstName: 'Jonathan', lastName: 'Doe'});
  });

  it('leaves the user untouched when updating with no prior user', () => {
    const {result} = renderHook(() => useContext(AuthContext), {wrapper});

    act(() => result.current.updateUser({firstName: 'Jonathan'}));

    expect(result.current.user).toBeNull();
  });
});
