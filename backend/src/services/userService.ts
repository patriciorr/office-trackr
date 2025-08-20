import UserRepository from '../repositories/userRepository';
import {IUser} from '../models/User';
import bcrypt from 'bcryptjs';
import {logger} from '../config/logger';
import {ValidationError} from '../utils/AppError';
import {commonPasswords} from '../utils/commonPasswords';
import {randomUUID} from 'crypto';

export default class UserService {
  private userRepository = new UserRepository();

  async createUser(userData: Partial<IUser>) {
    logger.info(`UserService: createUser called for email: ${userData.email}`);
    if (!userData.email) throw new ValidationError('Email is required');
    if (!userData.password) throw new ValidationError('Password is required');
    if (!userData.firstName) throw new ValidationError('First name is required');
    if (!userData.lastName) throw new ValidationError('Last name is required');

    await this.validateEmail(userData.email);
    await this.validatePassword(userData.password);
    await this.validateName(userData.firstName);
    await this.validateName(userData.lastName);

    userData.password = await bcrypt.hash(userData.password, 12);
    logger.info(`UserService: password hashed for email: ${userData.email}`);

    userData.id = randomUUID();
    logger.info(`UserService: generated ID for user: ${userData.id}`);

    return this.userRepository.create(userData);
  }

  async getUserByEmail(email: string) {
    logger.info(`UserService: getUserByEmail called for email: ${email}`);
    return this.userRepository.findByEmail(email, false);
  }

  async getUserById(id: string) {
    logger.info(`UserService: getUserById called for id: ${id}`);
    return this.userRepository.findById(id);
  }

  async getAllUsers() {
    logger.info('UserService: getAllUsers called');
    return this.userRepository.findAll();
  }

  async updateUser(id: string, update: Partial<IUser>) {
    logger.info(`UserService: updateUser called for id: ${id}`);
    if (update.email) {
      await this.validateEmail(update.email);
    }
    if (update.password) {
      await this.validatePassword(update.password);
      update.password = await bcrypt.hash(update.password, 12);
    }
    if (update.firstName) {
      await this.validateName(update.firstName);
    }
    if (update.lastName) {
      await this.validateName(update.lastName);
    }
    return this.userRepository.updateById(id, update);
  }

  async deleteUser(id: string) {
    logger.info(`UserService: deleteUser called for id: ${id}`);
    return this.userRepository.deleteById(id);
  }

  private async validateEmail(email: string) {
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
    if (!emailRegex.test(email)) {
      logger.warn(`UserService: invalid email format: ${email}`);
      throw new ValidationError('Invalid email format');
    }

    const existingUser = await this.userRepository.findByEmail(email, false);
    if (existingUser) {
      logger.warn(`UserService: email already registered: ${email}`);
      throw new ValidationError('Email is already registered');
    }
  }

  private async validatePassword(password: string) {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;
    if (!strongRegex.test(password)) {
      logger.warn(`UserService: weak password`);
      throw new ValidationError(
        'Password must be at least 12 characters and include uppercase, lowercase, number, and special character'
      );
    }

    if (commonPasswords.includes(password.toLowerCase())) {
      logger.warn(`UserService: common password used`);
      throw new ValidationError('Password is too common. Choose a more secure password');
    }
  }

  private async validateName(name: string) {
    if (name.length < 1 || name.length > 20) {
      logger.warn(`UserService: invalid name length: ${name}`);
      throw new ValidationError('Name must be between 1 and 20 characters');
    }
    const nameRegex = /^[a-zA-Z]+$/;
    if (!nameRegex.test(name)) {
      logger.warn(`UserService: invalid name format: ${name}`);
      throw new ValidationError('Name can only contain letters');
    }
  }
}
