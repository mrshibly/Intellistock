import { Router } from 'express';
import { InsightController } from './insight.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', InsightController.list);
router.patch('/:id/read', InsightController.markAsRead);
router.post('/chat', InsightController.chat);
router.post('/generate', InsightController.triggerManual);

export default router;
