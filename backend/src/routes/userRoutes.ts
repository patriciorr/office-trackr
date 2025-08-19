import { Router } from 'express';
import UserController from '../controllers/userController';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', UserController.createUser);
router.get('/', authenticateJWT, authorizeRoles('admin', 'manager'), UserController.getAll);

export default router;
