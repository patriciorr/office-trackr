import {describe, expect, it, jest} from '@jest/globals';
import jwt from 'jsonwebtoken';
import {authenticateJWT, authorizeRoles} from '../../../src/middleware/authMiddleware';

jest.mock('jsonwebtoken');

const response = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authMiddleware', () => {
  it('returns 401 when no authorization header is present', () => {
    const res = response();
    const next = jest.fn();

    authenticateJWT({headers: {}} as any, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({error: 'No token provided'});
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches a valid user and calls next', () => {
    const req: any = {headers: {authorization: 'Bearer token'}};
    const res = response();
    const next = jest.fn();
    (jwt.verify as any).mockImplementation((_token: string, _secret: string, callback: Function) => {
      callback(null, {id: 'user-1', role: 'admin'});
    });

    authenticateJWT(req, res, next);

    expect(req.user).toEqual({id: 'user-1', role: 'admin'});
    expect(next).toHaveBeenCalled();
  });

  it('accepts a valid token with a payload that has no user id', () => {
    const req: any = {headers: {authorization: 'Bearer token'}};
    const next = jest.fn();
    (jwt.verify as any).mockImplementation((_token: string, _secret: string, callback: Function) => {
      callback(null, {role: 'coworker'});
    });

    authenticateJWT(req, response(), next);

    expect(req.user).toEqual({role: 'coworker'});
    expect(next).toHaveBeenCalled();
  });

  it('returns 403 when the token is invalid', () => {
    const res = response();
    const next = jest.fn();
    (jwt.verify as any).mockImplementation((_token: string, _secret: string, callback: Function) => {
      callback(new Error('invalid token'), undefined);
    });

    authenticateJWT({headers: {authorization: 'Bearer token'}} as any, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({error: 'Invalid token'});
    expect(next).not.toHaveBeenCalled();
  });

  it('authorizes users with an allowed role', () => {
    const next = jest.fn();

    authorizeRoles('admin', 'manager')({user: {id: 'user-1', role: 'manager'}} as any, response(), next);

    expect(next).toHaveBeenCalled();
  });

  it('returns 403 when a user role is not allowed', () => {
    const res = response();

    authorizeRoles('admin')({user: {id: 'user-1', role: 'coworker'}} as any, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({error: 'Forbidden'});
  });
});
