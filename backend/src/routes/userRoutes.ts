import {Router} from 'express';
import UserController from '../controllers/userController';
import {authenticateJWT, authorizeRoles} from '../middleware/authMiddleware';

const router = Router();

router.post('/register', UserController.createUser);
router.get('/', authenticateJWT, authorizeRoles('admin', 'manager'), UserController.getAll);
router.get('/:id', authenticateJWT, UserController.getById);
router.put('/:id', authenticateJWT, UserController.updateUser);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), UserController.deleteUser);

export default router;
