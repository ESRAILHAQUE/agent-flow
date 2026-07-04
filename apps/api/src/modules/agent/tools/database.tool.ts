import { prisma } from '@agentflow/database';

// ============================================================
// Database Tool — FR-06 (Database Tool Calling)
// Allows an AI agent to query the organization's business data
// ============================================================

export const DatabaseToolSchema = {
  type: 'function',
  function: {
    name: 'database_search',
    description:
      'Search and retrieve business data from the organization database. Use this to look up customers, leads, conversations, agents, or documents.',
    parameters: {
      type: 'object',
      properties: {
        entity: {
          type: 'string',
          enum: ['leads', 'conversations', 'agents', 'documents'],
          description: 'The type of entity to search for.',
        },
        query: {
          type: 'string',
          description: 'A search keyword to filter results by name, email, title, or status.',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of records to return. Defaults to 5.',
        },
      },
      required: ['entity'],
    },
  },
};

export async function executeDatabaseTool(
  args: { entity: string; query?: string; limit?: number },
  context: { orgId: string },
): Promise<string> {
  const { entity, query, limit = 5 } = args;
  const { orgId } = context;

  try {
    switch (entity) {
      case 'leads': {
        const leads = await prisma.lead.findMany({
          where: {
            orgId,
            ...(query
              ? {
                  OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                    { company: { contains: query, mode: 'insensitive' } },
                    { status: { equals: query.toUpperCase() as any } },
                  ],
                }
              : {}),
          },
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true,
            status: true,
            source: true,
            createdAt: true,
          },
        });
        return JSON.stringify({ total: leads.length, leads });
      }

      case 'conversations': {
        const conversations = await prisma.conversation.findMany({
          where: {
            orgId,
            ...(query
              ? { title: { contains: query, mode: 'insensitive' } }
              : {}),
          },
          take: limit,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            title: true,
            agentType: true,
            updatedAt: true,
            _count: { select: { messages: true } },
          },
        });
        return JSON.stringify({ total: conversations.length, conversations });
      }

      case 'agents': {
        const agents = await prisma.agent.findMany({
          where: {
            orgId,
            ...(query
              ? {
                  OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                  ],
                }
              : {}),
          },
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            description: true,
            modelId: true,
            isActive: true,
            createdAt: true,
          },
        });
        return JSON.stringify({ total: agents.length, agents });
      }

      case 'documents': {
        const documents = await prisma.document.findMany({
          where: {
            orgId,
            ...(query
              ? {
                  OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { status: { equals: query.toUpperCase() as any } },
                  ],
                }
              : {}),
          },
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            type: true,
            size: true,
            status: true,
            createdAt: true,
          },
        });
        return JSON.stringify({ total: documents.length, documents });
      }

      default:
        return JSON.stringify({ error: `Unknown entity type: ${entity}` });
    }
  } catch (error: any) {
    return JSON.stringify({ error: `Database query failed: ${error.message}` });
  }
}
