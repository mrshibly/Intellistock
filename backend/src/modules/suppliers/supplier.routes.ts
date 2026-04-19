import { Router } from 'express';
import { SupplierController } from './supplier.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { requireRole } from '../../middleware/roleGuard';

const router = Router();

router.use(requireAuth);

router.get('/', SupplierController.list);
router.get('/:id', SupplierController.getById);
router.post('/', requireRole('manager', 'admin', 'owner'), SupplierController.create);
router.patch('/:id', requireRole('manager', 'admin', 'owner'), SupplierController.update);
router.delete('/:id', requireRole('manager', 'admin', 'owner'), SupplierController.delete);

export default router;
