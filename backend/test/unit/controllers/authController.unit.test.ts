import {describe, expect, it, jest} from '@jest/globals';
import AuthController from '../../../src/controllers/authController';
import AuthService from '../../../src/services/authService';
import {AuthError} from '../../../src/utils/AppError';

jest.mock('../../../src/services/authService');

const response = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authController', () => {
  it('returns the login result', async () => {
    const result = {token: 'token', user: {id: 'user-1'}};
    (AuthService.prototype.login as any).mockResolvedValue(result);
    const res = response();

    await AuthController.login({body: {email: 'user@example.com', password: 'secret'}} as any, res);

    expect(AuthService.prototype.login).toHaveBeenCalledWith('user@example.com', 'secret');
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it('returns the authentication error status and message', async () => {
    (AuthService.prototype.login as any).mockRejectedValue(new AuthError('Invalid credentials'));
    const res = response();

    await AuthController.login({body: {email: 'user@example.com', password: 'wrong'}} as any, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({error: 'Invalid credentials'});
  });

  it('returns 500 for unexpected login failures', async () => {
    (AuthService.prototype.login as any).mockRejectedValue(new Error('database unavailable'));
    const res = response();

    await AuthController.login({body: {email: 'user@example.com', password: 'secret'}} as any, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({error: 'Internal server error'});
  });
});
