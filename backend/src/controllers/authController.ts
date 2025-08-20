import {Request, Response} from 'express';
import AuthService from '../services/authService';
import {AuthError} from '../utils/AppError';
import {logger} from '../config/logger';

const authService = new AuthService();

export default class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const {email, password} = req.body;
      logger.info(`Login attempt for email: ${email}`);
      const result = await authService.login(email, password);
      logger.info(`Login success for email: ${email}`);
      res.json(result);
    } catch (err: any) {
      logger.error(`Login failed for email: ${req.body.email} - ${err.message}`);
      if (err instanceof AuthError) {
        res.status(err.statusCode).json({error: err.message});
      } else {
        res.status(500).json({error: 'Internal server error'});
      }
    }
  }
}
