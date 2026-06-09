import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import type { JwtPayload } from '@agentflow/shared';

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload as object, config.jwt.accessSecret as jwt.Secret, {
    expiresIn: config.jwt.accessExpiry as any,
  });
}

export function signRefreshToken(payload: Omit<JwtPayload, 'orgId'>): string {
  return jwt.sign(payload as object, config.jwt.refreshSecret as jwt.Secret, {
    expiresIn: config.jwt.refreshExpiry as any,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.accessSecret as jwt.Secret) as JwtPayload;
}

export function verifyRefreshToken(token: string): Omit<JwtPayload, 'orgId'> {
  return jwt.verify(token, config.jwt.refreshSecret as jwt.Secret) as Omit<JwtPayload, 'orgId'>;
}
