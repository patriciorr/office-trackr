import User, {IUser} from '../models/User';
import {logger} from '../config/logger';
import {ListUsersFilter} from '../utils/listUserFilter';

export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  team?: string[];
}

export default class UserRepository {
  async findByEmail(email: string, isInternal: boolean): Promise<IUser | UserDTO | null> {
    logger.info(`UserRepository: findByEmail called for email: ${email}`);
    const user = await User.findOne({email});
    return user ? (isInternal ? user : this.toUserDTO(user)) : null;
  }

  async create(userData: Partial<IUser>) {
    logger.info(`UserRepository: create called for email: ${userData.email}`);
    const user = new User(userData);
    const savedUser = await user.save();
    return this.toUserDTO(savedUser);
  }

  async findById(id: string, isInternal: boolean): Promise<IUser | UserDTO | null> {
    logger.info(`UserRepository: findById called for id: ${id}`);
    const user = await User.findOne({id});
    return user ? (isInternal ? user : this.toUserDTO(user)) : null;
  }

  async listUsers(filter?: ListUsersFilter) {
    logger.info('UserRepository: listUsers called');
    let repoFilter = {};
    if (filter) {
      if (filter.roles) {
        repoFilter = {...repoFilter, role: {$in: filter.roles}};
      }
      if (filter.emails) {
        repoFilter = {...repoFilter, email: {$in: filter.emails}};
      }
      if (filter.ids) {
        repoFilter = {...repoFilter, id: {$in: filter.ids}};
      }
    }
    const users = await User.find(repoFilter);
    return users.map(this.toUserDTO);
  }

  async updateById(id: string, update: Partial<IUser>) {
    logger.info(`UserRepository: updateById called for id: ${id}`);
    const updatedUser = await User.findOneAndUpdate({id}, update, {
      new: true,
    });
    return updatedUser ? this.toUserDTO(updatedUser) : null;
  }

  async deleteById(id: string) {
    logger.info(`UserRepository: deleteById called for id: ${id}`);
    return User.findOneAndDelete({id});
  }

  private toUserDTO(user: IUser): UserDTO {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      team: user.team,
    };
  }
}
