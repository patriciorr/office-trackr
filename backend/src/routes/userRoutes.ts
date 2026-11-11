import {Router} from 'express';
import UserController from '../controllers/userController';
import {authenticateJWT, authorizeRoles} from '../middleware/authMiddleware';
import {logger} from '../config/logger';

const router = Router();

router.post('/', (req, res, next) => {
  if (process.env.DISABLE_REGISTRATION === 'true') {
    res.status(403).json({error: 'Registration is disabled'});
    return;
  }
  const role = req.body?.role;
  if (role !== undefined && role !== 'coworker' && role !== 'manager') {
    logger.warn('Rejected disallowed public registration role');
    res.status(400).json({error: 'Registration role must be coworker or manager'});
    return;
  }
  next();
}, UserController.createUser);
router.get('/', authenticateJWT, authorizeRoles('admin', 'manager'), UserController.listUsers);
router.get('/:id', authenticateJWT, UserController.getUserById);
router.patch('/:id', authenticateJWT, UserController.updateUser);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), UserController.deleteUser);

export default router;
