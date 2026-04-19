import { Router } from 'express';
import { ForecastController } from './forecast.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', ForecastController.list);
router.get('/:productId', ForecastController.getLatest);
router.post('/:productId/generate', ForecastController.triggerManual);

export default router;
