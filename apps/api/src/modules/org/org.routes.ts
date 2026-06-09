import { Router } from 'express';
import { OrgController } from './org.controller.js';
import { authenticate, requireOrg, requireRole } from '../../middleware/index.js';

const router = Router();

// Public route to accept invitation
router.post('/accept-invite', OrgController.acceptInvite);

// Protected tenant-specific routes
router.use(authenticate);

// Organization management
router.get('/', requireOrg, OrgController.getMyOrganization);
router.put('/', requireOrg, requireRole(['ORG_OWNER', 'SUPER_ADMIN']), OrgController.updateOrganization);

// Workspace (Team) Management
router.get('/workspaces', requireOrg, OrgController.getWorkspaces);
router.post('/workspaces', requireOrg, requireRole(['ORG_OWNER', 'SUPER_ADMIN']), OrgController.createWorkspace);
router.delete('/workspaces/:id', requireOrg, requireRole(['ORG_OWNER', 'SUPER_ADMIN']), OrgController.deleteWorkspace);

// Workspace Members and Invites
router.get('/workspaces/:id/members', requireOrg, OrgController.getWorkspaceMembers);
router.post('/workspaces/:id/invite', requireOrg, requireRole(['ORG_OWNER', 'SUPER_ADMIN']), OrgController.inviteMember);

export default router;
