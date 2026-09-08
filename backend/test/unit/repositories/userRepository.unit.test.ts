import UserRepository from '../../../src/repositories/userRepository';
import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import User, {IUser} from '../../../src/models/User';
import {ListUsersFilter} from '../../../src/utils/listUserFilter';

jest.mock('../../../src/models/User');

describe('userRepository', () => {
  const userModel = User as any;
  const repository = new UserRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('finds a user by email', async () => {
      const email = 'user@example.com';
      const isInternal = false;
      const user: Partial<IUser> = {id: '1', email, firstName: 'John', lastName: 'Doe', role: 'coworker'};
      userModel.findOne.mockResolvedValue(user);

      await expect(repository.findByEmail(email, isInternal)).resolves.toEqual(user);
      expect(userModel.findOne).toHaveBeenCalledWith({email: 'user@example.com'});
    });

    it('returns null if user not found', async () => {
      const email = 'nonexistent@example.com';
      const isInternal = false;
      userModel.findOne.mockResolvedValue(null);

      await expect(repository.findByEmail(email, isInternal)).resolves.toBeNull();
      expect(userModel.findOne).toHaveBeenCalledWith({email: 'nonexistent@example.com'});
    });

    it('returns internal user if isInternal is true', async () => {
      const email = 'internal@example.com';
      const isInternal = true;
      const user: Partial<IUser> = {id: '2', email, firstName: 'Jane', lastName: 'Smith', role: 'manager'};
      userModel.findOne.mockResolvedValue(user);

      await expect(repository.findByEmail(email, isInternal)).resolves.toEqual(user);
      expect(userModel.findOne).toHaveBeenCalledWith({email: 'internal@example.com'});
    });
  });

  describe('create', () => {
    it('creates a user and returns its DTO', async () => {
      const data: Partial<IUser> = {email: 'user@example.com', firstName: 'John', lastName: 'Doe', role: 'coworker'};
      const savedUser = {id: '1', ...data, ignored: true};
      userModel.mockImplementation(() => ({save: jest.fn<() => Promise<any>>().mockResolvedValue(savedUser)}));

      await expect(repository.create(data)).resolves.toEqual({id: '1', ...data});
      expect(userModel).toHaveBeenCalledWith(data);
    });
  });

  describe('findById', () => {
    it('finds a user by ID', async () => {
      const user: Partial<IUser> = {
        id: '1',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'coworker',
      };
      const isInternal = false;
      userModel.findOne.mockResolvedValue(user);

      await expect(repository.findById('1', isInternal)).resolves.toEqual(user);
      expect(userModel.findOne).toHaveBeenCalledWith({id: '1'});
    });

    it('returns null if user not found', async () => {
      const isInternal = false;
      userModel.findOne.mockResolvedValue(null);

      await expect(repository.findById('nonexistent', isInternal)).resolves.toBeNull();
      expect(userModel.findOne).toHaveBeenCalledWith({id: 'nonexistent'});
    });

    it('returns internal user if isInternal is true', async () => {
      const user: Partial<IUser> = {
        id: '2',
        email: 'internal@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'manager',
      };
      const isInternal = true;
      userModel.findOne.mockResolvedValue(user);

      await expect(repository.findById('2', isInternal)).resolves.toBe(user);
      expect(userModel.findOne).toHaveBeenCalledWith({id: '2'});
    });
  });

  describe('listUsers', () => {
    it('lists all users without filter and transforms them to DTO', async () => {
      const users: Partial<IUser>[] = [
        {id: '1', email: 'user1@example.com', firstName: 'John', lastName: 'Doe', role: 'coworker'},
        {id: '2', email: 'user2@example.com', firstName: 'Jane', lastName: 'Smith', role: 'manager'},
      ];
      userModel.find.mockResolvedValue(users);

      await expect(repository.listUsers()).resolves.toEqual(users);
      expect(userModel.find).toHaveBeenCalledWith({});
    });

    it('lists users with ids filter and transforms them to DTO', async () => {
      const users: Partial<IUser>[] = [
        {id: '1', email: 'user1@example.com', firstName: 'John', lastName: 'Doe', role: 'coworker'},
        {id: '2', email: 'user2@example.com', firstName: 'Jane', lastName: 'Smith', role: 'manager'},
      ];
      userModel.find.mockResolvedValue(users);
      const filter: ListUsersFilter = {ids: ['1', '2']};
      await expect(repository.listUsers(filter)).resolves.toEqual(users);
    });

    it('lists users with emails filter and transforms them to DTO', async () => {
      const users: Partial<IUser>[] = [
        {id: '1', email: 'user1@example.com', firstName: 'John', lastName: 'Doe', role: 'coworker'},
        {id: '2', email: 'user2@example.com', firstName: 'Jane', lastName: 'Smith', role: 'manager'},
      ];
      userModel.find.mockResolvedValue(users);
      const filter: ListUsersFilter = {emails: ['user1@example.com', 'user2@example.com']};
      await expect(repository.listUsers(filter)).resolves.toEqual(users);
    });

    it('lists users with roles filter and transforms them to DTO', async () => {
      const users: Partial<IUser>[] = [
        {id: '1', email: 'user1@example.com', firstName: 'John', lastName: 'Doe', role: 'coworker'},
        {id: '2', email: 'user2@example.com', firstName: 'Jane', lastName: 'Smith', role: 'manager'},
      ];
      userModel.find.mockResolvedValue(users);
      const filter: ListUsersFilter = {roles: ['coworker', 'manager']};
      await expect(repository.listUsers(filter)).resolves.toEqual(users);
    });

    it('lists users with the specified filter and transforms them to DTO', async () => {
      const users: Partial<IUser>[] = [
        {id: '1', email: 'user1@example.com', firstName: 'John', lastName: 'Doe', role: 'coworker'},
        {id: '2', email: 'user2@example.com', firstName: 'Jane', lastName: 'Smith', role: 'manager'},
      ];
      userModel.find.mockResolvedValue(users);
      const filter: ListUsersFilter = {
        roles: ['coworker', 'manager'],
        emails: ['user1@example.com', 'user2@example.com'],
        ids: ['1', '2'],
      };

      await expect(repository.listUsers(filter)).resolves.toEqual(users);
      expect(userModel.find).toHaveBeenCalledWith({
        role: {$in: ['coworker', 'manager']},
        email: {$in: ['user1@example.com', 'user2@example.com']},
        id: {$in: ['1', '2']},
      });
    });
  });

  describe('updateById', () => {
    it('updates and returns the DTO', async () => {
      const update: Partial<IUser> = {firstName: 'Updated'};
      const user: Partial<IUser> = {
        id: '1',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'coworker',
      };
      userModel.findOneAndUpdate.mockResolvedValue(user);

      await expect(repository.updateById('1', update)).resolves.toEqual(user);
      expect(userModel.findOneAndUpdate).toHaveBeenCalledWith({id: '1'}, update, {new: true});
    });

    it('returns null if user not found', async () => {
      const update: Partial<IUser> = {firstName: 'Updated'};
      userModel.findOneAndUpdate.mockResolvedValue(null);

      await expect(repository.updateById('nonexistent', update)).resolves.toBeNull();
      expect(userModel.findOneAndUpdate).toHaveBeenCalledWith({id: 'nonexistent'}, update, {new: true});
    });
  });

  describe('deleteById', () => {
    it('deletes a user by id', async () => {
      const user: Partial<IUser> = {id: '1'};
      userModel.findOneAndDelete.mockResolvedValue(user);

      await expect(repository.deleteById('1')).resolves.toEqual(user);
      expect(userModel.findOneAndDelete).toHaveBeenCalledWith({id: '1'});
    });
  });
});
