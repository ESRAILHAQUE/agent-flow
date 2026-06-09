import { Router, Request, Response } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import orgRoutes from '../modules/org/org.routes.js';

const router = Router();

// Mount modules
router.use('/auth', authRoutes);
router.use('/org', orgRoutes);

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

export default router;
