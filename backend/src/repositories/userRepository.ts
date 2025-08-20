import User, {IUser} from '../models/User';
import {logger} from '../config/logger';

export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
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

  async findById(id: string) {
    logger.info(`UserRepository: findById called for id: ${id}`);
    const user = await User.findOne({id});
    return user ? this.toUserDTO(user) : null;
  }

  async findAll() {
    logger.info('UserRepository: findAll called');
    const users = await User.find();
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
    };
  }
}
