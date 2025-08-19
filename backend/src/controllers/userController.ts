import { Request, Response } from "express";
import UserService from "../services/userService";
import { ValidationError, AppError } from "../utils/AppError";
import { logger } from "../config/logger";

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
        res.status(err.statusCode).json({ error: err.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      logger.info("Get all users request");
      const users = await userService.getAllUsers();
      logger.info(`Fetched ${users.length} users`);
      res.json(users);
    } catch (err: any) {
      logger.error(`Error fetching users: ${err}`);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
