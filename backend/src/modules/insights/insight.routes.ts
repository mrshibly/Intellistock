import { Router } from 'express';
import { InsightController } from './insight.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

router.use(requireAuth);

router.get('/', InsightController.list);
router.patch('/:id/read', InsightController.markAsRead);
router.post('/chat', InsightController.chat);
router.post('/generate', InsightController.triggerManual);

export default router;
