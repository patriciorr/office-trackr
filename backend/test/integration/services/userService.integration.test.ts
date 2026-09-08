import {describe, expect, it} from '@jest/globals';
import UserService from '../../../src/services/userService';
import {ValidationError} from '../../../src/utils/AppError';

describe('UserService (integration)', () => {
  const service = new UserService();

  const validUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: `john-${Date.now()}@example.com`,
    password: 'VioletCedar9!',
    role: 'coworker' as const,
  };

  it('creates a user, hashing the password and persisting it', async () => {
    const created = await service.createUser({...validUser});

    expect(created).toMatchObject({email: validUser.email, firstName: 'John', lastName: 'Doe', role: 'coworker'});
    expect(created.id).toBeDefined();

    const stored: any = await service.getUserByEmail(validUser.email);
    expect(stored.email).toBe(validUser.email);
  });

  it('rejects creating a user with a duplicate email', async () => {
    await service.createUser({...validUser, email: 'duplicate@example.com'});

    await expect(service.createUser({...validUser, email: 'duplicate@example.com'})).rejects.toEqual(
      new ValidationError('EM003 - Email is already registered')
    );
  });

  it.each([
    ['an invalid first name format', {firstName: 'John123'}, 'FN003 - First name can only contain letters'],
    [
      'a first name that is too long',
      {firstName: 'A'.repeat(21)},
      'FN002 - First name must be between 1 and 20 characters',
    ],
    ['an invalid last name format', {lastName: 'Doe-2'}, 'LN003 - Last name can only contain letters'],
    [
      'a last name that is too long',
      {lastName: 'D'.repeat(21)},
      'LN002 - Last name must be between 1 and 20 characters',
    ],
    ['an invalid email format', {email: 'not-an-email'}, 'EM002 - Invalid email format'],
    [
      'a weak password',
      {password: 'weak'},
      'PW002 - Password must be at least 12 characters and include uppercase, lowercase, number, and special character',
    ],
    ['a common password', {password: 'Password123!'}, 'PW003 - Password is too common. Choose a more secure password'],
  ])('rejects creating a user with %s', async (_case, overrides, message) => {
    await expect(
      service.createUser({...validUser, email: `invalid-${Date.now()}-${Math.random()}@example.com`, ...overrides})
    ).rejects.toEqual(new ValidationError(message));
  });

  it('rejects setting a team while creating a user', async () => {
    await expect(
      service.createUser({...validUser, email: 'team-on-create@example.com', team: ['some-user']})
    ).rejects.toEqual(new ValidationError('TEAM001 - Team cannot be set during user creation'));
  });

  it.each([
    ['firstName', 'FN001 - First name is required'],
    ['lastName', 'LN001 - Last name is required'],
    ['email', 'EM001 - Email is required'],
    ['password', 'PW001 - Password is required'],
  ])('rejects creating a user without a %s', async (field, message) => {
    const data: any = {...validUser, email: `missing-${field}-${Date.now()}@example.com`};
    delete data[field];

    await expect(service.createUser(data)).rejects.toEqual(new ValidationError(message));
  });

  it('updates a user through the secure password flow and persists the new hash', async () => {
    const created = await service.createUser({...validUser, email: 'update-flow@example.com'});

    const updated = await service.updateUser(created.id, {}, 'VioletCedar9!', 'NewSecurePass9!', 'NewSecurePass9!');

    expect(updated).toMatchObject({id: created.id});
  });

  it('rejects an update with an incorrect old password', async () => {
    const created = await service.createUser({...validUser, email: 'wrong-old-password@example.com'});

    await expect(
      service.updateUser(created.id, {}, 'WrongPassword1!', 'NewSecurePass9!', 'NewSecurePass9!')
    ).rejects.toEqual(new ValidationError('PW007 - Old password incorrect'));
  });

  it('rejects a password update for a user that does not exist', async () => {
    await expect(
      service.updateUser('missing-user-id', {}, 'VioletCedar9!', 'NewSecurePass9!', 'NewSecurePass9!')
    ).rejects.toEqual(new ValidationError('PW006 - User not found'));
  });

  it('rejects an update when only some password fields are supplied', async () => {
    const created = await service.createUser({...validUser, email: 'partial-password@example.com'});

    await expect(service.updateUser(created.id, {}, 'VioletCedar9!', 'NewSecurePass9!', undefined)).rejects.toEqual(
      new ValidationError('PW004 - All password fields are required')
    );
  });

  it('rejects an update when the new passwords do not match', async () => {
    const created = await service.createUser({...validUser, email: 'mismatched-password@example.com'});

    await expect(
      service.updateUser(created.id, {}, 'VioletCedar9!', 'NewSecurePass9!', 'DifferentPass9!')
    ).rejects.toEqual(new ValidationError('PW005 - New passwords do not match'));
  });

  it('rejects a direct password update outside the secure flow', async () => {
    const created = await service.createUser({...validUser, email: 'direct-password@example.com'});

    await expect(service.updateUser(created.id, {password: 'NewSecurePass9!'})).rejects.toEqual(
      new ValidationError('PW008 - Direct password update not allowed')
    );
  });

  it('validates first name, last name, and email format when updating a user', async () => {
    const created = await service.createUser({...validUser, email: 'update-validation@example.com'});

    await expect(service.updateUser(created.id, {firstName: 'John123'})).rejects.toEqual(
      new ValidationError('FN003 - First name can only contain letters')
    );
    await expect(service.updateUser(created.id, {lastName: 'Doe-2'})).rejects.toEqual(
      new ValidationError('LN003 - Last name can only contain letters')
    );
    await expect(service.updateUser(created.id, {email: 'not-an-email'})).rejects.toEqual(
      new ValidationError('EM002 - Invalid email format')
    );
  });

  it('rejects a non-array team when updating a user', async () => {
    const created = await service.createUser({...validUser, email: 'invalid-team-shape@example.com'});

    await expect(service.updateUser(created.id, {team: 'not-an-array' as any})).rejects.toEqual(
      new ValidationError('TEAM002 - Team must be an array of user IDs')
    );
  });

  it('validates team members exist before assigning a team', async () => {
    const owner = await service.createUser({...validUser, email: 'team-owner@example.com'});
    const member = await service.createUser({...validUser, email: 'team-member@example.com'});

    const updated: any = await service.updateUser(owner.id, {team: [member.id]});

    expect(updated.team).toEqual([member.id]);
  });

  it('rejects assigning an unknown team member', async () => {
    const owner = await service.createUser({...validUser, email: 'team-owner-2@example.com'});

    await expect(service.updateUser(owner.id, {team: ['missing-user']})).rejects.toEqual(
      new ValidationError('TEAM003 - Team member not found: missing-user')
    );
  });

  it('lists and deletes users through the repository', async () => {
    const created = await service.createUser({...validUser, email: 'to-delete@example.com'});

    const listed = await service.listUsers({ids: [created.id]});
    expect(listed).toHaveLength(1);

    const deleted: any = await service.deleteUser(created.id);
    expect(deleted?.id).toBe(created.id);
    await expect(service.getUserById(created.id)).resolves.toBeNull();
  });
});
