import { Request, Response, NextFunction } from 'express';
import { prisma } from '@agentflow/database';
import { HTTP_STATUS } from '@agentflow/shared';

// ============================================================
// Plan Limits Configuration
// FREE: 2 agents, 1 workspace, 5 documents, 1 workflow
// PRO: 10 agents, 5 workspaces, 100 documents, 20 workflows
// ENTERPRISE: unlimited
// ============================================================

export const PLAN_LIMITS = {
  FREE: {
    agents: 2,
    workspaces: 1,
    documents: 5,
    workflows: 1,
    teamMembers: 3,
  },
  PRO: {
    agents: 10,
    workspaces: 5,
    documents: 100,
    workflows: 20,
    teamMembers: 15,
  },
  ENTERPRISE: {
    agents: Infinity,
    workspaces: Infinity,
    documents: Infinity,
    workflows: Infinity,
    teamMembers: Infinity,
  },
} as const;

type LimitKey = keyof typeof PLAN_LIMITS.FREE;

/**
 * Middleware factory: checks if the org has reached a plan limit.
 * Usage: requireWithinLimit('agents')
 */
export function requireWithinLimit(resource: LimitKey) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.orgId;
      if (!orgId) {
        next();
        return;
      }

      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { plan: true },
      });

      if (!org) {
        next();
        return;
      }

      const plan = org.plan as keyof typeof PLAN_LIMITS;
      const limit = PLAN_LIMITS[plan]?.[resource] ?? Infinity;

      if (limit === Infinity) {
        next();
        return;
      }

      // Count current usage
      let currentCount = 0;

      switch (resource) {
        case 'agents':
          currentCount = await prisma.agent.count({ where: { orgId } });
          break;
        case 'workspaces':
          currentCount = await prisma.team.count({ where: { orgId } });
          break;
        case 'documents':
          currentCount = await prisma.document.count({ where: { orgId } });
          break;
        case 'workflows':
          currentCount = await prisma.workflow.count({ where: { orgId } });
          break;
        case 'teamMembers':
          currentCount = await prisma.teamMember.count({
            where: { team: { orgId }, inviteAccepted: true },
          });
          break;
      }

      if (currentCount >= limit) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: `Plan limit reached: Your ${plan} plan allows a maximum of ${limit} ${resource}. Please upgrade to create more.`,
          data: {
            resource,
            limit,
            current: currentCount,
            plan,
          },
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
