import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import UserController from '../../../src/controllers/userController';
import UserService from '../../../src/services/userService';
import {ValidationError} from '../../../src/utils/AppError';

jest.mock('../../../src/services/userService');

const response = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('userController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a user with a 201 response', async () => {
    const user = {id: 'user-1', email: 'user@example.com'};
    (UserService.prototype.createUser as any).mockResolvedValue(user);
    const res = response();

    await UserController.createUser({body: {email: user.email}} as any, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(user);
  });

  it('returns validation errors when user creation fails validation', async () => {
    (UserService.prototype.createUser as any).mockRejectedValue(new ValidationError('Invalid user'));
    const res = response();

    await UserController.createUser({body: {}} as any, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({error: 'Invalid user'});
  });

  it('returns 500 for an unexpected user creation error', async () => {
    (UserService.prototype.createUser as any).mockRejectedValue(new Error('database unavailable'));
    const res = response();

    await UserController.createUser({body: {}} as any, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({error: 'Internal server error'});
  });

  it('converts query parameters before listing users', async () => {
    (UserService.prototype.listUsers as any).mockResolvedValue([]);
    const res = response();

    await UserController.listUsers({query: {roles: 'admin,manager', ids: ['1', '2']}} as any, res);

    expect(UserService.prototype.listUsers).toHaveBeenCalledWith({roles: ['admin', 'manager'], ids: ['1', '2']});
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('returns 500 when listing users fails', async () => {
    (UserService.prototype.listUsers as any).mockRejectedValue(new Error('database unavailable'));
    const res = response();

    await UserController.listUsers({query: {}} as any, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({error: 'Internal server error'});
  });

  it('returns 404 when the requested user does not exist', async () => {
    (UserService.prototype.getUserById as any).mockResolvedValue(null);
    const res = response();

    await UserController.getUserById({params: {id: 'missing'}} as any, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({error: 'User not found'});
  });

  it('returns the requested user when it exists', async () => {
    const user = {id: 'user-1', email: 'user@example.com'};
    (UserService.prototype.getUserById as any).mockResolvedValue(user);
    const res = response();

    await UserController.getUserById({params: {id: 'user-1'}} as any, res);

    expect(res.json).toHaveBeenCalledWith(user);
  });

  it('returns 500 when fetching a user fails', async () => {
    (UserService.prototype.getUserById as any).mockRejectedValue(new Error('database unavailable'));
    const res = response();

    await UserController.getUserById({params: {id: 'user-1'}} as any, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({error: 'Internal server error'});
  });

  it('allows an admin to update another user', async () => {
    const user = {id: 'user-2', email: 'user@example.com'};
    (UserService.prototype.updateUser as any).mockResolvedValue(user);
    const res = response();

    await UserController.updateUser(
      {params: {id: 'user-2'}, body: {firstName: 'Updated'}, user: {id: 'admin-1', role: 'admin'}} as any,
      res
    );

    expect(UserService.prototype.updateUser).toHaveBeenCalledWith(
      'user-2',
      {firstName: 'Updated'},
      undefined,
      undefined,
      undefined
    );
    expect(res.json).toHaveBeenCalledWith(user);
  });

  it('forbids a user from updating another user', async () => {
    const res = response();

    await UserController.updateUser(
      {params: {id: 'user-2'}, body: {}, user: {id: 'user-1', role: 'coworker'}} as any,
      res
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({error: 'Forbidden'});
  });

  it.each([{role: 'admin'}, {$set: {role: 'admin'}}, {team: ['user-2']}])(
    'rejects privileged or unsupported fields in a coworker update',
    async body => {
      const res = response();
      await UserController.updateUser(
        {params: {id: 'user-1'}, body, user: {id: 'user-1', role: 'coworker'}} as any,
        res
      );
      expect([400, 403]).toContain(res.status.mock.calls[0][0]);
      expect(UserService.prototype.updateUser).not.toHaveBeenCalled();
    }
  );

  it('allows a manager to update their team', async () => {
    (UserService.prototype.updateUser as any).mockResolvedValue({id: 'manager-1'});
    const res = response();
    await UserController.updateUser(
      {params: {id: 'manager-1'}, body: {team: ['user-2']}, user: {id: 'manager-1', role: 'manager'}} as any,
      res
    );
    expect(UserService.prototype.updateUser).toHaveBeenCalledWith(
      'manager-1', {team: ['user-2']}, undefined, undefined, undefined
    );
  });

  it('returns 404 when an update finds no user', async () => {
    (UserService.prototype.updateUser as any).mockResolvedValue(null);
    const res = response();

    await UserController.updateUser(
      {params: {id: 'user-1'}, body: {}, user: {id: 'user-1', role: 'coworker'}} as any,
      res
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({error: 'User not found'});
  });

  it('maps update validation errors to their status code', async () => {
    (UserService.prototype.updateUser as any).mockRejectedValue(new ValidationError('Invalid update'));
    const res = response();

    await UserController.updateUser(
      {params: {id: 'user-1'}, body: {}, user: {id: 'user-1', role: 'coworker'}} as any,
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({error: 'Invalid update'});
  });

  it('forbids a user from deleting another user', async () => {
    const res = response();

    await UserController.deleteUser({params: {id: 'user-2'}, user: {id: 'user-1', role: 'coworker'}} as any, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({error: 'Forbidden'});
    expect(UserService.prototype.deleteUser).not.toHaveBeenCalled();
  });

  it('deletes an authorized user with a 204 response', async () => {
    (UserService.prototype.deleteUser as any).mockResolvedValue({id: 'user-1'});
    const res = response();

    await UserController.deleteUser({params: {id: 'user-1'}, user: {id: 'user-1', role: 'coworker'}} as any, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('returns 404 when deleting a missing user', async () => {
    (UserService.prototype.deleteUser as any).mockResolvedValue(null);
    const res = response();

    await UserController.deleteUser({params: {id: 'user-1'}, user: {id: 'user-1', role: 'coworker'}} as any, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({error: 'User not found'});
  });

  it('returns 500 when deleting a user fails unexpectedly', async () => {
    (UserService.prototype.deleteUser as any).mockRejectedValue(new Error('database unavailable'));
    const res = response();

    await UserController.deleteUser({params: {id: 'user-1'}, user: {id: 'user-1', role: 'coworker'}} as any, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({error: 'Internal server error'});
  });
});
