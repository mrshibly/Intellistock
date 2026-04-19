import { Router } from 'express';
import { OrgController } from './org.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { requireRole } from '../../middleware/roleGuard';

const router = Router();

router.use(requireAuth);

router.get('/me', OrgController.getMe);
router.patch('/me', requireRole('admin', 'owner'), OrgController.updateMe);
router.get('/me/members', OrgController.getMembers);
router.patch('/me/members/:userId/role', requireRole('admin', 'owner'), OrgController.updateMemberRole);

export default router;
