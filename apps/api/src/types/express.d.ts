import { JwtPayload } from '@agentflow/shared';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      orgId?: string;
    }
  }
}
export {};
