import { Request, Response, NextFunction } from 'express';
import { prisma } from '@agentflow/database';
import { HTTP_STATUS } from '@agentflow/shared';
import { AppError } from '../../middleware/error.middleware.js';
import { encrypt, maskApiKey, decrypt } from '../../lib/encryption.js';

/**
 * GET /api/org/api-keys
 * Returns masked API keys for the organization (never exposes raw keys)
 */
export const getApiKeys = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orgId = req.orgId!;
    const record = await prisma.orgApiKey.findUnique({ where: { orgId } });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        hasOpenrouterKey: !!record?.openrouterKey,
        hasOpenaiKey: !!record?.openaiKey,
        openrouterKeyMasked: record?.openrouterKey ? maskApiKey(decrypt(record.openrouterKey)) : null,
        openaiKeyMasked: record?.openaiKey ? maskApiKey(decrypt(record.openaiKey)) : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/org/api-keys
 * Save (or update) the org's encrypted API keys
 */
export const saveApiKeys = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orgId = req.orgId!;
    const { openrouterKey, openaiKey } = req.body as { openrouterKey?: string; openaiKey?: string };

    if (!openrouterKey && !openaiKey) {
      throw new AppError('At least one API key must be provided', HTTP_STATUS.BAD_REQUEST);
    }

    const updateData: Record<string, string | null> = {};

    if (openrouterKey !== undefined) {
      updateData.openrouterKey = openrouterKey ? encrypt(openrouterKey.trim()) : null;
    }
    if (openaiKey !== undefined) {
      updateData.openaiKey = openaiKey ? encrypt(openaiKey.trim()) : null;
    }

    await prisma.orgApiKey.upsert({
      where: { orgId },
      update: updateData,
      create: { orgId, ...updateData },
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'API keys saved and encrypted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/org/api-keys
 * Remove all API keys for the organization
 */
export const deleteApiKeys = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orgId = req.orgId!;
    await prisma.orgApiKey.deleteMany({ where: { orgId } });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'API keys removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/org/api-keys/test
 * Test if the stored API key works by making a lightweight request
 */
export const testApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orgId = req.orgId!;
    const { provider } = req.body as { provider: 'openrouter' | 'openai' };

    const record = await prisma.orgApiKey.findUnique({ where: { orgId } });
    if (!record) throw new AppError('No API keys configured for this organization', HTTP_STATUS.NOT_FOUND);

    let apiKey: string | null = null;
    let baseURL = 'https://api.openai.com/v1';

    if (provider === 'openrouter' && record.openrouterKey) {
      apiKey = decrypt(record.openrouterKey);
      baseURL = 'https://openrouter.ai/api/v1';
    } else if (provider === 'openai' && record.openaiKey) {
      apiKey = decrypt(record.openaiKey);
    } else {
      throw new AppError(`No ${provider} key configured`, HTTP_STATUS.BAD_REQUEST);
    }

    // Lightweight test: list models
    const response = await fetch(`${baseURL}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      throw new AppError('API key is invalid or unauthorized', HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `${provider} API key is valid and working!`,
    });
  } catch (error) {
    next(error);
  }
};
