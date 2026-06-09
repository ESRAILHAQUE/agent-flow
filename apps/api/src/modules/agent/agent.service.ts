import { PrismaClient } from '@prisma/client';
import { ApiError, HTTP_STATUS } from '@agentflow/shared';

const prisma = new PrismaClient();

export class AgentService {
  /**
   * Get all agents for an organization
   */
  static async getAgents(orgId: string) {
    return prisma.agent.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });
  }

  /**
   * Get a specific agent
   */
  static async getAgentById(orgId: string, agentId: string) {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId, orgId },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    if (!agent) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Agent not found');
    }

    return agent;
  }

  /**
   * Create a new agent
   */
  static async createAgent(orgId: string, userId: string, data: { name: string; description?: string; persona: string; modelId: string; tools: any[] }) {
    return prisma.agent.create({
      data: {
        name: data.name,
        description: data.description,
        persona: data.persona,
        modelId: data.modelId || 'openrouter/auto',
        tools: data.tools || [],
        orgId,
        createdById: userId,
      },
    });
  }

  /**
   * Update an agent
   */
  static async updateAgent(orgId: string, agentId: string, data: Partial<{ name: string; description: string; persona: string; modelId: string; tools: any[]; isActive: boolean }>) {
    const existing = await prisma.agent.findUnique({ where: { id: agentId, orgId } });
    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Agent not found');
    }

    return prisma.agent.update({
      where: { id: agentId },
      data,
    });
  }

  /**
   * Delete an agent
   */
  static async deleteAgent(orgId: string, agentId: string) {
    const existing = await prisma.agent.findUnique({ where: { id: agentId, orgId } });
    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Agent not found');
    }

    return prisma.agent.delete({
      where: { id: agentId },
    });
  }
}
