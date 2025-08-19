import User, { IUser } from "../models/User";
import { logger } from "../config/logger";

export default class UserRepository {
  async findByEmail(email: string) {
    logger.info(`UserRepository: findByEmail called for email: ${email}`);
    return User.findOne({ email });
  }

  async create(userData: Partial<IUser>) {
    logger.info(`UserRepository: create called for email: ${userData.email}`);
    const user = new User(userData);
    return user.save();
  }

  async findById(id: string) {
    logger.info(`UserRepository: findById called for id: ${id}`);
    return User.findById(id);
  }

  async findAll() {
    logger.info("UserRepository: findAll called");
    return User.find();
  }

  async updateById(id: string, update: Partial<IUser>) {
    logger.info(`UserRepository: updateById called for id: ${id}`);
    return User.findByIdAndUpdate(id, update, { new: true });
  }

  async deleteById(id: string) {
    logger.info(`UserRepository: deleteById called for id: ${id}`);
    return User.findByIdAndDelete(id);
  }
}
