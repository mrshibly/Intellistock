import { Router } from 'express';
import { PurchaseOrderController } from './purchaseOrder.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { requireRole } from '../../middleware/roleGuard';

const router = Router();

router.use(requireAuth);

router.get('/', PurchaseOrderController.list);
router.get('/:id', PurchaseOrderController.getById);
router.post('/', requireRole('manager', 'admin', 'owner'), PurchaseOrderController.create);
router.post('/:id/send', requireRole('manager', 'admin', 'owner'), PurchaseOrderController.send);
router.post('/:id/receive', requireRole('staff', 'manager', 'admin', 'owner'), PurchaseOrderController.receive);

export default router;
