import AuthRepository from "../repositories/authRepository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logger } from "../config/logger";
import { AuthError } from "../utils/AppError";

const authRepository = new AuthRepository();

export default class AuthService {
  async login(email: string, password: string) {
    logger.info(`Login attempt for email: ${email}`);
    const user = await authRepository.findByEmail(email);
    if (!user) {
      logger.warn(`Login failed - user not found: ${email}`);
  throw new AuthError("User not found");
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      logger.warn(`Login failed - invalid credentials: ${email}`);
  throw new AuthError("Invalid credentials");
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );
    return { token, user };
  }
}
