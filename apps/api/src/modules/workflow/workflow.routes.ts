import { Router } from 'express';
import { authenticate, requireOrg } from '../../middleware/auth.middleware.js';
import * as workflowController from './workflow.controller.js';

const router = Router();

router.use(authenticate);
router.use(requireOrg);

router.route('/')
  .get(workflowController.getWorkflows)
  .post(workflowController.createWorkflow);

router.route('/:id')
  .get(workflowController.getWorkflowById)
  .delete(workflowController.deleteWorkflow);

router.route('/:id/save')
  .post(workflowController.saveWorkflow);

export default router;
