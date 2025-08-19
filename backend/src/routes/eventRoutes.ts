import { Router } from 'express';
import EventController from '../controllers/eventController';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateJWT, EventController.createEvent);
router.get('/', authenticateJWT, EventController.listEvents);
router.put('/:id', authenticateJWT, EventController.updateEvent);
router.delete('/:id', authenticateJWT, EventController.deleteEvent);

export default router;
