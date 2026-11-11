import {afterEach, describe, expect, it, jest} from '@jest/globals';
import request from 'supertest';
import app from '../../../src/app';
import UserService from '../../../src/services/userService';

jest.mock('../../../src/services/userService');

describe('registration configuration', () => {
  afterEach(() => {
    delete process.env.DISABLE_REGISTRATION;
    jest.clearAllMocks();
  });

  it('blocks registration before creating an account when disabled', async () => {
    process.env.DISABLE_REGISTRATION = 'true';
    await request(app).post('/api/users').send({email: 'test@example.com', role: 'admin'}).expect(403);
    expect(UserService.prototype.createUser).not.toHaveBeenCalled();
  });

  it('keeps registration enabled when the flag is absent', async () => {
    jest.mocked(UserService.prototype.createUser).mockResolvedValue({
      id: '1', email: 'test@example.com', firstName: 'Demo', lastName: 'User', role: 'coworker',
    });
    await request(app).post('/api/users').send({email: 'test@example.com'}).expect(201);
  });
});
