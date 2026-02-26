// src/lib/auth/from-token.ts
import { NextRequest } from 'next/server';
import { verifyAccessToken, TokenPayload } from './jwt';

export function getUserFromToken(request: NextRequest): TokenPayload | null {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!token) {
    return null;
  }

  return verifyAccessToken(token);
}