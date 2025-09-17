import UserRepository from '../repositories/userRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {logger} from '../config/logger';
import {AuthError} from '../utils/AppError';
import {IUser} from '../models/User';

export default class AuthService {
  private userRepository = new UserRepository();

  async login(email: string, password: string) {
    logger.info(`Login attempt for email: ${email}`);
    const user = (await this.userRepository.findByEmail(email, true)) as IUser | null;
    if (!user) {
      logger.warn(`Login failed - user not found: ${email}`);
      throw new AuthError('AUTH001 - User not found');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      logger.warn(`Login failed - invalid credentials: ${email}`);
      throw new AuthError('AUTH002 - Invalid credentials');
    }
    const token = jwt.sign({id: user.id, role: user.role}, process.env.JWT_SECRET as string, {expiresIn: '1d'});
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        team: user.team ?? [],
      },
    };
  }
}
