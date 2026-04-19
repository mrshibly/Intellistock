import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface AccessPayload {
  userId: string;
  orgId: string;
  role: string;
}

export interface RefreshPayload {
  userId: string;
}

export function signAccess(payload: AccessPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function signRefresh(payload: RefreshPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

export function verifyAccess(token: string): AccessPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      const err = new Error('Access token expired') as any;
      err.code = 'TOKEN_EXPIRED';
      err.statusCode = 401;
      throw err;
    }
    const err = new Error('Invalid access token') as any;
    err.code = 'TOKEN_INVALID';
    err.statusCode = 401;
    throw err;
  }
}

export function verifyRefresh(token: string): RefreshPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload;
  } catch (error: any) {
    const err = new Error('Invalid refresh token') as any;
    err.code = 'REFRESH_TOKEN_INVALID';
    err.statusCode = 401;
    throw err;
  }
}
