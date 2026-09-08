import {beforeEach, describe, expect, it} from '@jest/globals';
import mongoose from 'mongoose';
import UserRepository from '../../../src/repositories/userRepository';
import User from '../../../src/models/User';

describe('UserRepository (integration)', () => {
  const repository = new UserRepository();

  const buildUser = (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: new mongoose.Types.ObjectId().toString(),
    firstName: 'John',
    lastName: 'Doe',
    email: `john-${Date.now()}-${Math.random()}@example.com`,
    password: 'hashed-password',
    role: 'coworker' as const,
    ...overrides,
  });

  describe('create', () => {
    it('persists a user and returns its DTO without the password', async () => {
      const data = buildUser();

      const created = await repository.create(data);

      expect(created).toEqual({
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        team: [],
      });
      const stored = await User.findOne({id: data.id});
      expect(stored?.password).toBe(data.password);
    });
  });

  describe('findByEmail', () => {
    it('finds a stored user by email as a DTO', async () => {
      const data = buildUser();
      await repository.create(data);

      const found = await repository.findByEmail(data.email, false);

      expect(found).toEqual({
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        team: [],
      });
    });

    it('returns the full document when isInternal is true', async () => {
      const data = buildUser();
      await repository.create(data);

      const found: any = await repository.findByEmail(data.email, true);

      expect(found.password).toBe(data.password);
    });

    it('returns null when no user matches the email', async () => {
      await expect(repository.findByEmail('missing@example.com', false)).resolves.toBeNull();
    });
  });

  describe('findById', () => {
    it('finds a stored user by id', async () => {
      const data = buildUser();
      await repository.create(data);

      await expect(repository.findById(data.id, false)).resolves.toEqual({
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        team: [],
      });
    });

    it('returns null when no user matches the id', async () => {
      await expect(repository.findById('missing-id', false)).resolves.toBeNull();
    });
  });

  describe('listUsers', () => {
    beforeEach(async () => {
      await repository.create(buildUser({id: 'user-1', email: 'user1@example.com', role: 'coworker'}));
      await repository.create(buildUser({id: 'user-2', email: 'user2@example.com', role: 'manager'}));
      await repository.create(buildUser({id: 'user-3', email: 'user3@example.com', role: 'admin'}));
    });

    it('lists every user when no filter is provided', async () => {
      const users = await repository.listUsers();

      expect(users).toHaveLength(3);
    });

    it('filters users by role', async () => {
      const users = await repository.listUsers({roles: ['manager']});

      expect(users.map(u => u.id)).toEqual(['user-2']);
    });

    it('filters users by email and id combined', async () => {
      const users = await repository.listUsers({emails: ['user1@example.com'], ids: ['user-1', 'user-3']});

      expect(users.map(u => u.id)).toEqual(['user-1']);
    });
  });

  describe('updateById', () => {
    it('updates a user and returns the refreshed DTO', async () => {
      const data = buildUser();
      await repository.create(data);

      const updated = await repository.updateById(data.id, {firstName: 'Updated'});

      expect(updated?.firstName).toBe('Updated');
    });

    it('returns null when the user does not exist', async () => {
      await expect(repository.updateById('missing-id', {firstName: 'Updated'})).resolves.toBeNull();
    });
  });

  describe('deleteById', () => {
    it('deletes a user by id', async () => {
      const data = buildUser();
      await repository.create(data);

      const deleted: any = await repository.deleteById(data.id);

      expect(deleted?.id).toBe(data.id);
      await expect(User.findOne({id: data.id})).resolves.toBeNull();
    });

    it('returns null when the user does not exist', async () => {
      await expect(repository.deleteById('missing-id')).resolves.toBeNull();
    });
  });
});
