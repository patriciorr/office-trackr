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
    if (!userData.firstName) throw new ValidationError('FN001 - First name is required');
    if (!userData.lastName) throw new ValidationError('LN001 - Last name is required');
    if (!userData.email) throw new ValidationError('EM001 - Email is required');
    if (!userData.password) throw new ValidationError('PW001 - Password is required');

    await this.validateFirstName(userData.firstName);
    await this.validateLastName(userData.lastName);
    await this.validateEmail(userData.email);
    await this.validatePassword(userData.password);

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
    return this.userRepository.findById(id, false);
  }

  async getAllUsers() {
    logger.info('UserService: getAllUsers called');
    return this.userRepository.findAll();
  }

  async updateUser(
    id: string,
    update: Partial<IUser>,
    oldPassword?: string,
    newPassword?: string,
    confirmPassword?: string
  ) {
    logger.info(`UserService: updateUser called for id: ${id}`);

    if (oldPassword || newPassword || confirmPassword) {
      if (!oldPassword || !newPassword || !confirmPassword) {
        throw new ValidationError('PW004 - All password fields are required');
      }
      if (newPassword !== confirmPassword) {
        throw new ValidationError('PW005 - New passwords do not match');
      }

      const user = await this.userRepository.findById(id, true) as IUser;
      if (!user) throw new ValidationError('PW006 - User not found');

      const valid = await bcrypt.compare(oldPassword, user.password);
      if (!valid) throw new ValidationError('PW007 - Old password incorrect');

      await this.validatePassword(newPassword);

      update.password = await bcrypt.hash(newPassword, 12);
    }

    if (update.email) {
      await this.validateEmail(update.email);
    }
    if (update.password && !(oldPassword || newPassword || confirmPassword)) {
      // Only allow password update via secure flow
      throw new ValidationError('PW008 - Direct password update not allowed');
    }
    if (update.firstName) {
      await this.validateFirstName(update.firstName);
    }
    if (update.lastName) {
      await this.validateLastName(update.lastName);
    }
  return this.userRepository.updateById(id, update);
  }

  async deleteUser(id: string) {
    logger.info(`UserService: deleteUser called for id: ${id}`);
    return this.userRepository.deleteById(id);
  }

  private async validateFirstName(name: string) {
    if (name.length < 1 || name.length > 20) {
      logger.warn(`UserService: invalid first name length: ${name}`);
      throw new ValidationError('FN002 - First name must be between 1 and 20 characters');
    }
    const nameRegex = /^[a-zA-Z]+$/;
    if (!nameRegex.test(name)) {
      logger.warn(`UserService: invalid first name format: ${name}`);
      throw new ValidationError('FN003 - First name can only contain letters');
    }
  }

  private async validateLastName(name: string) {
    if (name.length < 1 || name.length > 20) {
      logger.warn(`UserService: invalid last name length: ${name}`);
      throw new ValidationError('LN002 - Last name must be between 1 and 20 characters');
    }
    const nameRegex = /^[a-zA-Z]+$/;
    if (!nameRegex.test(name)) {
      logger.warn(`UserService: invalid last name format: ${name}`);
      throw new ValidationError('LN003 - Last name can only contain letters');
    }
  }

  private async validateEmail(email: string) {
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
    if (!emailRegex.test(email)) {
      logger.warn(`UserService: invalid email format: ${email}`);
      throw new ValidationError('EM002 - Invalid email format');
    }

    const existingUser = await this.userRepository.findByEmail(email, false);
    if (existingUser) {
      logger.warn(`UserService: email already registered: ${email}`);
      throw new ValidationError('EM003 - Email is already registered');
    }
  }

  private async validatePassword(password: string) {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;
    if (!strongRegex.test(password)) {
      logger.warn(`UserService: weak password`);
      throw new ValidationError(
        'PW002 - Password must be at least 12 characters and include uppercase, lowercase, number, and special character'
      );
    }

    if (commonPasswords.some((pw) => password.toLowerCase().includes(pw))) {
      logger.warn(`UserService: common password used`);
      throw new ValidationError('PW003 - Password is too common. Choose a more secure password');
    }
  }
}
