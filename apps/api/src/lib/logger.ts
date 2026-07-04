import { prisma } from '@agentflow/database';

export async function logAudit(actorId: string, action: string, targetId?: string, metadata?: any) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        targetId,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      }
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
