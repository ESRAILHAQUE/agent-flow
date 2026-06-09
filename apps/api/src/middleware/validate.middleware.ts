import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { HTTP_STATUS, type ApiResponse } from '@agentflow/shared';

/**
 * Middleware factory that validates request body against a Zod schema.
 * On failure, returns 422 with detailed field-level errors.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(err.message);
        });

        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          errors,
        };

        res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json(response);
        return;
      }
      next(error);
    }
  };
}
