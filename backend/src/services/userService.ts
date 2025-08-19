import UserRepository from "../repositories/userRepository";
import { IUser } from "../models/User";
import bcrypt from "bcryptjs";
import { logger } from "../config/logger";
import { ValidationError } from "../utils/AppError";

export default class UserService {
  private userRepository = new UserRepository();

  async createUser(userData: Partial<IUser>) {
    logger.info(`UserService: createUser called for email: ${userData.email}`);
    if (!userData.email) throw new ValidationError("Email is required");
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
    if (!emailRegex.test(userData.email)) {
      logger.warn(`UserService: invalid email format: ${userData.email}`);
      throw new ValidationError("Invalid email format");
    }
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      logger.warn(`UserService: email already registered: ${userData.email}`);
      throw new ValidationError("Email is already registered");
    }
    if (!userData.password) throw new ValidationError("Password is required");
    const password = userData.password;
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;
    if (!strongRegex.test(password)) {
      logger.warn(`UserService: weak password for email: ${userData.email}`);
      throw new ValidationError(
        "Password must be at least 12 characters and include uppercase, lowercase, number, and special character"
      );
    }
    const commonPasswords = [
      "123456",
      "password",
      "123456789",
      "12345678",
      "12345",
      "qwerty",
      "abc123",
      "football",
      "monkey",
      "letmein",
      "111111",
      "1234",
      "1234567",
      "dragon",
      "baseball",
      "sunshine",
      "iloveyou",
      "trustno1",
      "princess",
      "admin",
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
      logger.warn(
        `UserService: common password used for email: ${userData.email}`
      );
      throw new ValidationError(
        "Password is too common. Choose a more secure password"
      );
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    userData.password = hashedPassword;
    logger.info(`UserService: password hashed for email: ${userData.email}`);
    return this.userRepository.create(userData);
  }

  async getUserByEmail(email: string) {
    logger.info(`UserService: getUserByEmail called for email: ${email}`);
    return this.userRepository.findByEmail(email);
  }

  async getUserById(id: string) {
    logger.info(`UserService: getUserById called for id: ${id}`);
    return this.userRepository.findById(id);
  }

  async getAllUsers() {
    logger.info("UserService: getAllUsers called");
    return this.userRepository.findAll();
  }

  async updateUser(id: string, update: Partial<IUser>) {
    logger.info(`UserService: updateUser called for id: ${id}`);
    return this.userRepository.updateById(id, update);
  }

  async deleteUser(id: string) {
    logger.info(`UserService: deleteUser called for id: ${id}`);
    return this.userRepository.deleteById(id);
  }
}
