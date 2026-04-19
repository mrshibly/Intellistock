import { Router } from 'express';
import { WarehouseController } from './warehouse.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { requireRole } from '../../middleware/roleGuard';

const router = Router();

router.use(requireAuth);

router.get('/', WarehouseController.list);
router.get('/:id', WarehouseController.getById);
router.post('/', requireRole('admin', 'owner'), WarehouseController.create);
router.patch('/:id', requireRole('admin', 'owner'), WarehouseController.update);
router.delete('/:id', requireRole('admin', 'owner'), WarehouseController.delete);

export default router;
