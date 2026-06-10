import { prisma } from '@agentflow/database';
import { AppError } from '../../middleware/error.middleware.js';
import { HTTP_STATUS } from '@agentflow/shared';
import OpenAI from 'openai';
import { config } from '../../config/index.js';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import pdfParse from 'pdf-parse';

export class RagService {
  private static getOpenAI() {
    if (!config.llm.openrouterApiKey) {
      throw new AppError('OpenRouter API key is missing. Required for generating embeddings.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
    return new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: config.llm.openrouterApiKey,
      defaultHeaders: {
        'HTTP-Referer': config.clientUrl,
        'X-Title': 'AgentFlow',
      }
    });
  }

  /**
   * Process an uploaded file and generate embeddings
   */
  static async processDocument(orgId: string, file: Express.Multer.File, originalName: string) {
    const openai = this.getOpenAI();

    // 1. Create Document Record in DB
    const document = await prisma.document.create({
      data: {
        name: originalName,
        type: originalName.toLowerCase().endsWith('.pdf') ? 'PDF' : 'TXT',
        url: 'local', // Placeholder for MVP
        size: file.size,
        status: 'PROCESSING',
        orgId: orgId,
      },
    });

    try {
      // 2. Extract Text
      let rawText = '';
      if (file.mimetype === 'application/pdf') {
        const pdfData = await pdfParse(file.buffer);
        rawText = pdfData.text;
      } else {
        // Fallback for TXT
        rawText = file.buffer.toString('utf-8');
      }

      if (!rawText.trim()) {
        throw new Error('No text could be extracted from the document.');
      }

      // 3. Chunk Text
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const chunks = await splitter.createDocuments([rawText]);

      // 4. Generate Embeddings and Save to DB
      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i].pageContent;
        
        // Generate embedding vector using OpenRouter's free embedding model
        const embeddingResponse = await openai.embeddings.create({
          model: 'nomic-ai/nomic-embed-text-v1.5',
          input: chunkText,
        });
        
        const vector = embeddingResponse.data[0].embedding;

        // Save to DB (Store vector in metadata JSON for MVP)
        await prisma.embedding.create({
          data: {
            content: chunkText,
            vectorId: `${document.id}_chunk_${i}`,
            chunkIndex: i,
            documentId: document.id,
            metadata: {
              vector: vector,
            },
          },
        });
      }

      // 5. Mark as READY
      await prisma.document.update({
        where: { id: document.id },
        data: { status: 'READY' },
      });

      return document;

    } catch (error: any) {
      console.error('RAG Processing Error:', error);
      await prisma.document.update({
        where: { id: document.id },
        data: { 
          status: 'ERROR',
          error: error.message 
        },
      });
      throw new AppError(`Failed to process document: ${error.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Helper function to calculate cosine similarity
   */
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Search knowledge base for relevant chunks
   */
  static async searchKnowledgeBase(orgId: string, query: string, limit: number = 3) {
    const openai = this.getOpenAI();

    // 1. Generate embedding for query using OpenRouter
    const queryEmbeddingResponse = await openai.embeddings.create({
      model: 'nomic-ai/nomic-embed-text-v1.5',
      input: query,
    });
    const queryVector = queryEmbeddingResponse.data[0].embedding;

    // 2. Fetch all embeddings for this organization's active documents
    const documents = await prisma.document.findMany({
      where: { orgId, status: 'READY' },
      select: { id: true }
    });
    const documentIds = documents.map(d => d.id);

    if (documentIds.length === 0) {
      return [];
    }

    const allEmbeddings = await prisma.embedding.findMany({
      where: { documentId: { in: documentIds } }
    });

    // 3. Compute similarities
    const results = allEmbeddings.map(emb => {
      const metadata = emb.metadata as { vector?: number[] };
      const vector = metadata?.vector;
      let score = 0;
      if (vector && Array.isArray(vector)) {
        score = this.cosineSimilarity(queryVector, vector);
      }
      return {
        content: emb.content,
        score,
        documentId: emb.documentId
      };
    });

    // 4. Sort and return top N
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }
}
