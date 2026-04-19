import { Router } from 'express';
import { MovementController } from './movement.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { requireRole } from '../../middleware/roleGuard';

const router = Router();

router.use(requireAuth);

router.get('/', MovementController.list);
router.get('/:id', MovementController.getById);
router.post('/', requireRole('staff', 'manager', 'admin', 'owner'), MovementController.create);

export default router;
