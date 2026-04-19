import { Router } from 'express';
import { ProductController } from './product.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { requireRole } from '../../middleware/roleGuard';

const router = Router();

router.use(requireAuth);

router.get('/', ProductController.list);
router.get('/:id', ProductController.getById);
router.post('/', requireRole('manager', 'admin', 'owner'), ProductController.create);
router.patch('/:id', requireRole('manager', 'admin', 'owner'), ProductController.update);
router.delete('/:id', requireRole('manager', 'admin', 'owner'), ProductController.delete);

export default router;
