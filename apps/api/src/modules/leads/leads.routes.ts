import { Router } from 'express';
import { authenticate, requireOrg } from '../../middleware/auth.middleware.js';
import * as leadsController from './leads.controller.js';

const router = Router();

router.use(authenticate);
router.use(requireOrg);

router.route('/')
  .get(leadsController.getLeads)
  .post(leadsController.createLead);

router.route('/:id')
  .put(leadsController.updateLead)
  .delete(leadsController.deleteLead);

export default router;
