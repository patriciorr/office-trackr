import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import bcrypt from 'bcryptjs';
import {randomUUID} from 'crypto';
import UserService from '../../../src/services/userService';
import UserRepository from '../../../src/repositories/userRepository';
import {ValidationError} from '../../../src/utils/AppError';
import {IUser} from '../../../src/models/User';

jest.mock('bcryptjs');
jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto') as typeof import('crypto');
  return {...actual, randomUUID: jest.fn()};
});
jest.mock('../../../src/repositories/userRepository');

describe('userService', () => {
  const repository = UserRepository as any;
  const service = new UserService();
  const validData: Partial<IUser> = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'VioletCedar9!',
    role: 'coworker',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (repository.prototype.findByEmail as any).mockResolvedValue(null);
    (bcrypt.hash as any).mockResolvedValue('hashed-password');
    (randomUUID as any).mockReturnValue('user-1');
  });

  it('validates, hashes, assigns an id, and creates a user', async () => {
    (repository.prototype.create as any).mockResolvedValue({id: 'user-1', email: validData.email});

    await expect(service.createUser({...validData})).resolves.toEqual({id: 'user-1', email: validData.email});
    expect(bcrypt.hash).toHaveBeenCalledWith('VioletCedar9!', 12);
    expect(repository.prototype.create).toHaveBeenCalledWith({
      ...validData,
      password: 'hashed-password',
      id: 'user-1',
    });
  });

  it('rejects a weak password during creation', async () => {
    await expect(service.createUser({...validData, password: 'weak'})).rejects.toEqual(
      new ValidationError(
        'PW002 - Password must be at least 12 characters and include uppercase, lowercase, number, and special character'
      )
    );
    expect(repository.prototype.create).not.toHaveBeenCalled();
  });

  it.each([
    ['first name', {...validData, firstName: undefined}, 'FN001 - First name is required'],
    ['last name', {...validData, lastName: undefined}, 'LN001 - Last name is required'],
    ['email', {...validData, email: undefined}, 'EM001 - Email is required'],
    ['password', {...validData, password: undefined}, 'PW001 - Password is required'],
  ])('requires a %s when creating a user', async (_field, data, message) => {
    await expect(service.createUser(data)).rejects.toEqual(new ValidationError(message));
  });

  it.each([
    ['first name', {firstName: 'John123'}, 'FN003 - First name can only contain letters'],
    ['last name', {lastName: 'Doe-2'}, 'LN003 - Last name can only contain letters'],
    ['email', {email: 'invalid-email'}, 'EM002 - Invalid email format'],
  ])('rejects an invalid %s during creation', async (_field, data, message) => {
    await expect(service.createUser({...validData, ...data})).rejects.toEqual(new ValidationError(message));
  });

  it('rejects names longer than twenty characters', async () => {
    await expect(service.createUser({...validData, firstName: 'A'.repeat(21)})).rejects.toEqual(
      new ValidationError('FN002 - First name must be between 1 and 20 characters')
    );
  });

  it('rejects a last name longer than twenty characters', async () => {
    await expect(service.createUser({...validData, lastName: 'D'.repeat(21)})).rejects.toEqual(
      new ValidationError('LN002 - Last name must be between 1 and 20 characters')
    );
  });

  it('rejects a common password during creation', async () => {
    await expect(service.createUser({...validData, password: 'Password123!'})).rejects.toEqual(
      new ValidationError('PW003 - Password is too common. Choose a more secure password')
    );
  });

  it('rejects a duplicate email during creation', async () => {
    (repository.prototype.findByEmail as any).mockResolvedValue({id: 'existing'});

    await expect(service.createUser({...validData})).rejects.toEqual(
      new ValidationError('EM003 - Email is already registered')
    );
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  it('rejects teams during creation', async () => {
    await expect(service.createUser({...validData, team: ['user-2']})).rejects.toEqual(
      new ValidationError('TEAM001 - Team cannot be set during user creation')
    );
  });

  it('updates a user through the secure password flow', async () => {
    const existingUser = {id: 'user-1', password: 'old-hash'};
    (repository.prototype.findById as any).mockResolvedValue(existingUser);
    (bcrypt.compare as any).mockResolvedValue(true);
    (repository.prototype.updateById as any).mockResolvedValue({id: 'user-1'});

    await expect(service.updateUser('user-1', {}, 'OldPassword1!', 'VioletCedar9!', 'VioletCedar9!')).resolves.toEqual({
      id: 'user-1',
    });
    expect(repository.prototype.updateById).toHaveBeenCalledWith('user-1', {password: 'hashed-password'});
  });

  it('rejects direct password updates', async () => {
    await expect(service.updateUser('user-1', {password: 'NewPassword1!'})).rejects.toEqual(
      new ValidationError('PW008 - Direct password update not allowed')
    );
  });

  it.each([
    [undefined, 'NewPassword1!', 'NewPassword1!', 'PW004 - All password fields are required'],
    ['OldPassword1!', 'NewPassword1!', 'DifferentPassword1!', 'PW005 - New passwords do not match'],
  ])('validates password update fields', async (oldPassword, newPassword, confirmPassword, message) => {
    await expect(service.updateUser('user-1', {}, oldPassword, newPassword, confirmPassword)).rejects.toEqual(
      new ValidationError(message)
    );
  });

  it('rejects a password update when the user does not exist', async () => {
    (repository.prototype.findById as any).mockResolvedValue(null);

    await expect(service.updateUser('missing', {}, 'OldPassword1!', 'VioletCedar9!', 'VioletCedar9!')).rejects.toEqual(
      new ValidationError('PW006 - User not found')
    );
  });

  it('rejects a password update when the old password is incorrect', async () => {
    (repository.prototype.findById as any).mockResolvedValue({password: 'old-hash'});
    (bcrypt.compare as any).mockResolvedValue(false);

    await expect(service.updateUser('user-1', {}, 'WrongPassword1!', 'VioletCedar9!', 'VioletCedar9!')).rejects.toEqual(
      new ValidationError('PW007 - Old password incorrect')
    );
  });

  it('rejects a weak replacement password', async () => {
    (repository.prototype.findById as any).mockResolvedValue({password: 'old-hash'});
    (bcrypt.compare as any).mockResolvedValue(true);

    await expect(service.updateUser('user-1', {}, 'OldPassword1!', 'weak', 'weak')).rejects.toEqual(
      new ValidationError(
        'PW002 - Password must be at least 12 characters and include uppercase, lowercase, number, and special character'
      )
    );
  });

  it('validates team members when updating a user', async () => {
    (repository.prototype.findById as any).mockResolvedValue({id: 'member-1'});
    (repository.prototype.updateById as any).mockResolvedValue({id: 'user-1'});

    await expect(service.updateUser('user-1', {team: ['member-1']})).resolves.toEqual({id: 'user-1'});
    expect(repository.prototype.findById).toHaveBeenCalledWith('member-1', false);
  });

  it('rejects an unknown team member', async () => {
    (repository.prototype.findById as any).mockResolvedValue(null);

    await expect(service.updateUser('user-1', {team: ['missing']})).rejects.toEqual(
      new ValidationError('TEAM003 - Team member not found: missing')
    );
  });

  it('rejects a non-array team update', async () => {
    await expect(service.updateUser('user-1', {team: 'user-2' as any})).rejects.toEqual(
      new ValidationError('TEAM002 - Team must be an array of user IDs')
    );
  });

  it('validates email and names when updating a user', async () => {
    (repository.prototype.updateById as any).mockResolvedValue({id: 'user-1'});

    await expect(
      service.updateUser('user-1', {email: 'updated@example.com', firstName: 'Jane', lastName: 'Smith'})
    ).resolves.toEqual({id: 'user-1'});
    expect(repository.prototype.findByEmail).toHaveBeenCalledWith('updated@example.com', false);
    expect(repository.prototype.updateById).toHaveBeenCalledWith('user-1', {
      email: 'updated@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
    });
  });

  it('delegates reads and deletion', async () => {
    (repository.prototype.findByEmail as any).mockResolvedValue({id: 'user-1'});
    (repository.prototype.findById as any).mockResolvedValue({id: 'user-1'});
    (repository.prototype.listUsers as any).mockResolvedValue([]);
    (repository.prototype.deleteById as any).mockResolvedValue({id: 'user-1'});

    await service.getUserByEmail('john@example.com');
    await service.getUserById('user-1');
    await service.listUsers({ids: ['user-1']});
    await service.deleteUser('user-1');

    expect(repository.prototype.findByEmail).toHaveBeenCalledWith('john@example.com', false);
    expect(repository.prototype.findById).toHaveBeenCalledWith('user-1', false);
    expect(repository.prototype.listUsers).toHaveBeenCalledWith({ids: ['user-1']});
    expect(repository.prototype.deleteById).toHaveBeenCalledWith('user-1');
  });
});
