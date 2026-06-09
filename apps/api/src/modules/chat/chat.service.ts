import OpenAI from 'openai';
import { tavily } from '@tavily/core';
import { config } from '../../config/index.js';
import { prisma } from '@agentflow/database';
import { AppError } from '../../middleware/error.middleware.js';
import { HTTP_STATUS } from '@agentflow/shared';

const openai = new OpenAI({
  baseURL: config.llm.provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : 'https://api.openai.com/v1',
  apiKey: config.llm.provider === 'openrouter' ? config.llm.openrouterApiKey : config.llm.openaiApiKey,
  defaultHeaders: config.llm.provider === 'openrouter' ? {
    'HTTP-Referer': config.clientUrl,
    'X-Title': 'AgentFlow',
  } : undefined,
});

const tvly = tavily({ apiKey: config.llm.tavilyApiKey || 'MISSING_KEY' });

export class ChatService {
  /**
   * Process a message for a specific agent
   */
  static async processMessage(orgId: string, agentId: string, message: string) {
    if (!config.llm.openrouterApiKey && !config.llm.openaiApiKey) {
      throw new AppError('LLM API key is not configured', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    // 1. Verify agent belongs to org and is active
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        orgId: orgId,
        isActive: true,
      },
    });

    if (!agent) {
      throw new AppError('Agent not found or inactive', HTTP_STATUS.NOT_FOUND);
    }

    try {
      // Setup Tools
      const agentTools: any[] = (agent.tools as any[]) || [];
      const hasWebSearch = agentTools.some(t => t.name === 'web_search');
      
      let tools: OpenAI.Chat.Completions.ChatCompletionTool[] | undefined = undefined;
      
      if (hasWebSearch) {
        tools = [
          {
            type: "function",
            function: {
              name: "web_search",
              description: "Search the internet for real-time information, news, facts, or context.",
              parameters: {
                type: "object",
                properties: {
                  query: { type: "string", description: "The search query" }
                },
                required: ["query"],
              },
            },
          }
        ];
      }

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: agent.persona },
        { role: 'user', content: message }
      ];

      // First LLM Call
      const response = await openai.chat.completions.create({
        model: agent.modelId || 'openrouter/auto',
        messages,
        tools,
      });

      const responseMessage = response.choices[0]?.message;

      // Check if the LLM wants to call a tool
      if (responseMessage?.tool_calls) {
        messages.push(responseMessage); // Add assistant's tool call request to history

        for (const toolCall of responseMessage.tool_calls) {
          if (toolCall.function.name === 'web_search') {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              console.log(`[Agent Tool Execution] Web Search for: "${args.query}"`);
              
              const searchResult = await tvly.search(args.query, { searchDepth: "advanced", maxResults: 3 });
              
              // Add the tool result to history
              messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: JSON.stringify(searchResult.results.map(r => ({ title: r.title, content: r.content }))),
              });
            } catch (err) {
              console.error('Tavily search failed:', err);
              messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: "Error: Web search failed to retrieve results.",
              });
            }
          }
        }

        // Second LLM Call with the tool results
        const secondResponse = await openai.chat.completions.create({
          model: agent.modelId || 'openrouter/auto',
          messages,
        });

        return {
          role: 'assistant',
          content: secondResponse.choices[0]?.message?.content || 'No response generated.',
          modelUsed: agent.modelId,
        };
      }

      // If no tools were called, return standard response
      return {
        role: 'assistant',
        content: responseMessage?.content || 'No response generated.',
        modelUsed: agent.modelId,
      };

    } catch (error: any) {
      console.error('LLM Error:', error);
      throw new AppError(`Failed to generate agent response: ${error.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}
