import { Router } from 'express';
import { UserController } from './user.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

router.use(requireAuth);

router.get('/me', UserController.getMe);
router.patch('/me', UserController.updateMe);
router.delete('/me', UserController.deleteMe);
router.get('/me/export', UserController.exportMe);

export default router;
