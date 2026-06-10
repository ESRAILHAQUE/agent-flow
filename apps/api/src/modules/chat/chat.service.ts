import OpenAI from 'openai';
import { tavily } from '@tavily/core';
import { config } from '../../config/index.js';
import { prisma } from '@agentflow/database';
import { AppError } from '../../middleware/error.middleware.js';
import { HTTP_STATUS } from '@agentflow/shared';
import { sendEmail } from '../../lib/email.js';
import { RagService } from '../knowledge/rag.service.js';

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
      const hasEmailSender = agentTools.some(t => t.name === 'email_sender');
      const hasKnowledgeSearch = agentTools.some(t => t.name === 'knowledge_search');
      
      const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [];
      
      if (hasWebSearch) {
        tools.push({
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
        });
      }

      if (hasEmailSender) {
        tools.push({
          type: "function",
          function: {
            name: "email_sender",
            description: "Send an email to a specific recipient. Use this when the user asks you to send an email to someone.",
            parameters: {
              type: "object",
              properties: {
                to: { type: "string", description: "The recipient's email address" },
                subject: { type: "string", description: "The subject of the email" },
                body: { type: "string", description: "The HTML body content of the email" }
              },
              required: ["to", "subject", "body"],
            },
          },
        });
      }

      if (hasKnowledgeSearch) {
        tools.push({
          type: "function",
          function: {
            name: "knowledge_search",
            description: "Search the internal organization knowledge base (uploaded PDFs/documents) for relevant information. Use this to answer questions about company policies, internal docs, or specific uploaded files.",
            parameters: {
              type: "object",
              properties: {
                query: { type: "string", description: "The search query to match against documents" }
              },
              required: ["query"],
            },
          },
        });
      }

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: agent.persona },
        { role: 'user', content: message }
      ];

      // First LLM Call
      const response = await openai.chat.completions.create({
        model: agent.modelId || 'openrouter/auto',
        messages,
        tools: tools.length > 0 ? tools : undefined,
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
          else if (toolCall.function.name === 'email_sender') {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              console.log(`[Agent Tool Execution] Sending Email to: "${args.to}"`);
              
              await sendEmail({
                to: args.to,
                subject: args.subject,
                html: args.body,
              });
              
              // Add the tool result to history
              messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: `Success: Email sent to ${args.to} with subject "${args.subject}".`,
              });
            } catch (err) {
              console.error('Email sending failed:', err);
              messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: "Error: Failed to send the email due to a system error.",
              });
            }
          }
          else if (toolCall.function.name === 'knowledge_search') {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              console.log(`[Agent Tool Execution] Knowledge Search for: "${args.query}"`);
              
              const searchResults = await RagService.searchKnowledgeBase(orgId, args.query, 3);
              
              // Add the tool result to history
              messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: searchResults.length > 0 
                  ? JSON.stringify(searchResults.map(r => ({ text: r.content, relevanceScore: r.score })))
                  : "No relevant information found in the knowledge base.",
              });
            } catch (err) {
              console.error('Knowledge search failed:', err);
              messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: "Error: Failed to search the knowledge base.",
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
