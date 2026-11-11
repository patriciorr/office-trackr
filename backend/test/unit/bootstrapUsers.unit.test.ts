import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';
import {bootstrapUsers} from '../../src/bootstrapUsers';
import UserService from '../../src/services/userService';

jest.mock('../../src/services/userService');

describe('bootstrapUsers', () => {
  const keys = [
    'BOOTSTRAP_USERS', 'DISABLE_REGISTRATION', 'BOOTSTRAP_ADMIN_EMAIL', 'BOOTSTRAP_ADMIN_PASSWORD',
    'BOOTSTRAP_COWORKER_EMAIL', 'BOOTSTRAP_COWORKER_PASSWORD',
  ];

  beforeEach(() => {
    Object.assign(process.env, {
      BOOTSTRAP_USERS: 'true',
      DISABLE_REGISTRATION: 'true',
      BOOTSTRAP_ADMIN_EMAIL: 'admin@example.com',
      BOOTSTRAP_ADMIN_PASSWORD: 'ExamplePassword9!',
      BOOTSTRAP_COWORKER_EMAIL: 'user@example.com',
      BOOTSTRAP_COWORKER_PASSWORD: 'AnotherPassword9!',
    });
    jest.mocked(UserService.prototype.getUserByEmail).mockResolvedValue(null);
  });

  afterEach(() => {
    keys.forEach(key => delete process.env[key]);
    jest.clearAllMocks();
  });

  it('creates both accounts only when bootstrap is enabled', async () => {
    await bootstrapUsers();
    expect(UserService.prototype.createUser).toHaveBeenCalledTimes(2);
    expect(UserService.prototype.createUser).toHaveBeenCalledWith(expect.objectContaining({role: 'admin'}));
    expect(UserService.prototype.createUser).toHaveBeenCalledWith(expect.objectContaining({role: 'coworker'}));
  });

  it('does not overwrite existing accounts and rejects a conflicting role', async () => {
    jest.mocked(UserService.prototype.getUserByEmail).mockResolvedValue({
      id: '1', firstName: 'Demo', lastName: 'User', email: 'admin@example.com', role: 'coworker',
    });

    await expect(bootstrapUsers()).rejects.toThrow('unexpected role');
    expect(UserService.prototype.createUser).not.toHaveBeenCalled();
  });

  it('leaves matching existing accounts unchanged on a repeated bootstrap', async () => {
    jest.mocked(UserService.prototype.getUserByEmail)
      .mockResolvedValueOnce({id: '1', firstName: 'Demo', lastName: 'Admin', email: 'admin@example.com', role: 'admin'})
      .mockResolvedValueOnce({id: '2', firstName: 'Demo', lastName: 'User', email: 'user@example.com', role: 'coworker'});
    await bootstrapUsers();
    expect(UserService.prototype.createUser).not.toHaveBeenCalled();
  });

  it('does not initialize without the flag', async () => {
    delete process.env.BOOTSTRAP_USERS;
    await bootstrapUsers();
    expect(UserService.prototype.getUserByEmail).not.toHaveBeenCalled();
  });

  it('rejects missing credentials, duplicate emails, and enabled registration', async () => {
    delete process.env.BOOTSTRAP_ADMIN_PASSWORD;
    await expect(bootstrapUsers()).rejects.toThrow('required');
    process.env.BOOTSTRAP_ADMIN_PASSWORD = 'ExamplePassword9!';
    process.env.BOOTSTRAP_COWORKER_EMAIL = 'ADMIN@example.com';
    await expect(bootstrapUsers()).rejects.toThrow('different email');
    process.env.DISABLE_REGISTRATION = 'false';
    await expect(bootstrapUsers()).rejects.toThrow('DISABLE_REGISTRATION');
    expect(UserService.prototype.createUser).not.toHaveBeenCalled();
  });
});
