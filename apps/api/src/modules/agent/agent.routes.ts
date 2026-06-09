import { Router } from 'express';
import { AgentController } from './agent.controller.js';
import { authenticate, requireOrg } from '../../middleware/auth.middleware.js';

const router = Router();

// All agent routes require authentication and an active organization context
router.use(authenticate);
router.use(requireOrg);

router.get('/', AgentController.getAgents);
router.get('/:id', AgentController.getAgentById);
router.post('/', AgentController.createAgent);
router.put('/:id', AgentController.updateAgent);
router.delete('/:id', AgentController.deleteAgent);

// Mount chat routes for specific agent
import { chatRoutes } from '../chat/chat.routes.js';
router.use('/:id/chat', chatRoutes);

export const agentRoutes = router;
