import { Router } from 'express';
import multer from 'multer';
import { KnowledgeController } from './knowledge.controller.js';
import { authenticate, requireOrg } from '../../middleware/auth.middleware.js';
import { requireWithinLimit } from '../../middleware/plan-limits.middleware.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);
router.use(requireOrg);

router.post('/upload', requireWithinLimit('documents'), upload.single('file'), KnowledgeController.uploadDocument);

export const knowledgeRoutes = router;
