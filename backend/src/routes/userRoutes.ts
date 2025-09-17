import {Router} from 'express';
import UserController from '../controllers/userController';
import {authenticateJWT, authorizeRoles} from '../middleware/authMiddleware';

const router = Router();

router.post('/', UserController.createUser);
router.get('/', authenticateJWT, authorizeRoles('admin', 'manager'), UserController.listUsers);
router.get('/:id', authenticateJWT, UserController.getUserById);
router.patch('/:id', authenticateJWT, UserController.updateUser);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), UserController.deleteUser);

export default router;
