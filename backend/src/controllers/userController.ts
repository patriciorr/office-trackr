import {Request, Response} from 'express';
import UserService from '../services/userService';
import {ValidationError, AppError} from '../utils/AppError';
import {logger} from '../config/logger';
import {AuthRequest} from '../middleware/authMiddleware';
import {ListUsersFilter, toListUsersFilter} from '../utils/listUserFilter';

const userService = new UserService();

export default class UserController {
  static async createUser(req: Request, res: Response) {
    try {
      logger.info(`User registration attempt: ${req.body.email}`);
      const user = await userService.createUser(req.body);
      logger.info(`User registered: ${user.email}`);
      res.status(201).json(user);
    } catch (err: any) {
      logger.error(`Error registering user: ${req.body.email} - ${err}`);
      if (err instanceof ValidationError) {
        res.status(err.statusCode).json({error: err.message});
      } else {
        res.status(500).json({error: 'Internal server error'});
      }
    }
  }

  static async listUsers(req: Request, res: Response) {
    try {
      logger.info('Get all users request');

      let filter: ListUsersFilter = {};
      if (req.query) {
        filter = toListUsersFilter(req.query);
      }
      logger.info(`Applying filter: ${JSON.stringify(filter)}`);

      const users = await userService.listUsers(filter);
      logger.info(`Fetched ${users.length} users`);
      res.json(users);
    } catch (err: any) {
      logger.error(`Error fetching users: ${err}`);
      res.status(500).json({error: 'Internal server error'});
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      logger.info(`Get user by ID request: ${userId}`);
      const user = await userService.getUserById(userId);
      if (!user) {
        logger.warn(`User not found: ${userId}`);
        return res.status(404).json({error: 'User not found'});
      }
      logger.info(`Fetched user: ${user.email}`);
      res.json(user);
    } catch (err: any) {
      logger.error(`Error fetching user by ID: ${req.params.id} - ${err}`);
      res.status(500).json({error: 'Internal server error'});
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const authReq = req as AuthRequest;
      logger.info(`Update user request: ${userId}`);

      if (authReq.user?.id !== userId && authReq.user?.role !== 'admin') {
        logger.warn(`Unauthorized update attempt by user: ${authReq.user?.id}`);
        return res.status(403).json({error: 'Forbidden'});
      }

      const {oldPassword, newPassword, confirmPassword, ...rest} = req.body;
      const user = await userService.updateUser(userId, rest, oldPassword, newPassword, confirmPassword);

      if (!user) {
        logger.warn(`User not found: ${userId}`);
        return res.status(404).json({error: 'User not found'});
      }
      logger.info(`User updated: ${user.email}`);
      res.json(user);
    } catch (err: any) {
      logger.error(`Error updating user: ${req.params.id} - ${err}`);
      if (err instanceof ValidationError) {
        res.status(err.statusCode).json({error: err.message});
      } else {
        res.status(500).json({error: 'Internal server error'});
      }
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const authReq = req as AuthRequest;
      logger.info(`Delete user request: ${userId}`);

      if (authReq.user?.id !== userId && authReq.user?.role !== 'admin') {
        logger.warn(`Unauthorized delete attempt by user: ${authReq.user?.id}`);
        return res.status(403).json({error: 'Forbidden'});
      }

      const result = await userService.deleteUser(userId);
      if (!result) {
        logger.warn(`User not found: ${userId}`);
        return res.status(404).json({error: 'User not found'});
      }
      logger.info(`User deleted: ${userId}`);
      res.status(204).send();
    } catch (err: any) {
      logger.error(`Error deleting user: ${req.params.id} - ${err}`);
      res.status(500).json({error: 'Internal server error'});
    }
  }
}
