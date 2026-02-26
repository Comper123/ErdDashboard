import { NextRequest } from 'next/server';
import { verifyAccessToken } from './jwt';

export interface UserFromRequest {
  id: string;
  email: string;
}

export function getUserFromRequest(request: NextRequest): UserFromRequest | null {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;
  console.log(token);
  if (!token) {
    return null;
  }

  const payload = verifyAccessToken(token);
  
  if (!payload) {
    return null;
  }

  return {
    id: payload.userId,
    email: payload.email,
  };
}