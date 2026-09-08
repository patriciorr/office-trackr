import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AuthService from '../../../src/services/authService';
import UserRepository from '../../../src/repositories/userRepository';
import {IUser} from '../../../src/models/User';
import {AuthError} from '../../../src/utils/AppError';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../../src/repositories/userRepository');

describe('authService', () => {
  const repository = UserRepository as any;
  const service = new AuthService();

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('returns a token and user details when credentials are valid', async () => {
    const user: Partial<IUser> = {
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashed-password',
      role: 'coworker',
    };
    (repository.prototype.findByEmail as any).mockResolvedValue(user as IUser);
    (bcrypt.compare as any).mockResolvedValue(true);
    (jwt.sign as any).mockReturnValue('signed-token');

    await expect(service.login('user@example.com', 'Password123!')).resolves.toEqual({
      token: 'signed-token',
      user: {
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'coworker',
        team: [],
      },
    });
    expect(repository.prototype.findByEmail).toHaveBeenCalledWith('user@example.com', true);
    expect(bcrypt.compare).toHaveBeenCalledWith('Password123!', 'hashed-password');
    expect(jwt.sign).toHaveBeenCalledWith({id: 'user-1', role: 'coworker'}, 'test-secret', {expiresIn: '1d'});
  });

  it('throws an authentication error when the user does not exist', async () => {
    (repository.prototype.findByEmail as any).mockResolvedValue(null);

    await expect(service.login('missing@example.com', 'Password123!')).rejects.toEqual(
      new AuthError('AUTH001 - User not found')
    );
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('throws an authentication error when the password is invalid', async () => {
    (repository.prototype.findByEmail as any).mockResolvedValue({password: 'hashed-password'} as IUser);
    (bcrypt.compare as any).mockResolvedValue(false);

    await expect(service.login('user@example.com', 'wrong-password')).rejects.toEqual(
      new AuthError('AUTH002 - Invalid credentials')
    );
    expect(jwt.sign).not.toHaveBeenCalled();
  });
});
