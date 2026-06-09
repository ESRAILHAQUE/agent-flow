import { Router } from 'express';
import { ChatController } from './chat.controller.js';
import { authenticate, requireOrg } from '../../middleware/auth.middleware.js';

const router = Router({ mergeParams: true });

// Routes are mounted under /api/agents/:id/chat
router.use(authenticate);
router.use(requireOrg);

router.post('/', ChatController.processMessage);

export const chatRoutes = router;
