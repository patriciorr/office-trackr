import {beforeEach, describe, expect, it} from '@jest/globals';
import UserService from '../../../src/services/userService';
import AuthService from '../../../src/services/authService';
import {AuthError} from '../../../src/utils/AppError';
import User from '../../../src/models/User';

describe('AuthService (integration)', () => {
  const userService = new UserService();
  const authService = new AuthService();

  const credentials = {
    firstName: 'Jane',
    lastName: 'Smith',
    email: `jane-${Date.now()}@example.com`,
    password: 'VioletCedar9!',
    role: 'coworker' as const,
  };

  beforeEach(async () => {
    process.env.JWT_SECRET = 'integration-test-secret';
    await userService.createUser({...credentials});
  });

  it('logs in with valid credentials and returns a signed token', async () => {
    const result = await authService.login(credentials.email, credentials.password);

    expect(result.token).toEqual(expect.any(String));
    expect(result.user).toMatchObject({email: credentials.email, firstName: 'Jane', lastName: 'Smith'});
  });

  it('rejects login with an incorrect password', async () => {
    await expect(authService.login(credentials.email, 'WrongPassword1!')).rejects.toEqual(
      new AuthError('AUTH002 - Invalid credentials')
    );
  });

  it('rejects login for an unknown email', async () => {
    await expect(authService.login('missing@example.com', credentials.password)).rejects.toEqual(
      new AuthError('AUTH001 - User not found')
    );
  });

  it('defaults the team to an empty array for legacy documents without one', async () => {
    await User.collection.updateOne({email: credentials.email}, {$unset: {team: ''}});

    const result = await authService.login(credentials.email, credentials.password);

    expect(result.user.team).toEqual([]);
  });
});
