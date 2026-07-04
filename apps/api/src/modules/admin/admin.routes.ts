import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import * as adminController from './admin.controller.js';

const router = Router();

import { Request, Response, NextFunction } from 'express';

const catchAsync = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// All admin routes require authentication + SUPER_ADMIN role
router.use(authenticate);
router.use(requireRole('SUPER_ADMIN'));

router.get('/stats', catchAsync(adminController.getSystemStats));
router.get('/stats/abuse', catchAsync(adminController.getAbuseStats));

router.get('/organizations', catchAsync(adminController.getAllOrganizations));
router.delete('/organizations/:id', catchAsync(adminController.deleteOrganization));
router.put('/organizations/:id/plan', catchAsync(adminController.updateOrgPlan));

router.get('/users', catchAsync(adminController.getAllUsers));
router.put('/users/:id/role', catchAsync(adminController.updateUserRole));
router.post('/users/:id/suspend', catchAsync(adminController.suspendUser));
router.post('/users/:id/activate', catchAsync(adminController.activateUser));
router.post('/users/:id/impersonate', catchAsync(adminController.impersonateUser));

router.get('/subscriptions', catchAsync(adminController.getAllSubscriptions));
router.get('/payments', catchAsync(adminController.getAllPayments));

router.get('/settings', catchAsync(adminController.getSettings));
router.put('/settings/:key', catchAsync(adminController.updateSetting));

router.get('/notifications', catchAsync(adminController.getNotifications));
router.post('/notifications', catchAsync(adminController.createNotification));
router.delete('/notifications/:id', catchAsync(adminController.deleteNotification));

router.get('/audit-logs', catchAsync(adminController.getAuditLogs));

export default router;
