import User, { IUser } from "../models/User";
import { logger } from "../config/logger";

export default class AuthRepository {
  async findByEmail(email: string) {
    logger.info(`AuthRepository: findByEmail called for email: ${email}`);
    return User.findOne({ email });
  }
}
