import { Router } from 'express';
import { ForecastController } from './forecast.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { requireRole } from '../../middleware/roleGuard';

const router = Router();

router.use(requireAuth);

router.get('/', ForecastController.list);
router.get('/reorder-plan', ForecastController.reorderPlan);
router.post('/generate', requireRole('manager', 'admin', 'owner'), ForecastController.generateAll);
router.get('/:productId', ForecastController.getLatest);
router.post('/:productId/generate', requireRole('manager', 'admin', 'owner'), ForecastController.triggerManual);

export default router;
