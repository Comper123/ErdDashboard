// src/lib/auth/token-db.ts
import { db } from '../db';
import { refreshTokens } from '../db/schema';
import { eq, and, lt } from 'drizzle-orm';
import { getTokenExpiry } from './jwt';

export async function saveRefreshToken(userId: string, token: string) {
  const expiresAt = getTokenExpiry(token);
  
  if (!expiresAt) {
    throw new Error('Invalid token');
  }

  // Удаляем старые токены пользователя (опционально, чтобы не засорять БД)
  await db.delete(refreshTokens).where(
    and(
      eq(refreshTokens.userId, userId),
      lt(refreshTokens.expiresAt, new Date()) // Удаляем только истекшие
    )
  );

  // Сохраняем новый токен
  const [savedToken] = await db.insert(refreshTokens).values({
    userId,
    token,
    expiresAt,
  }).returning();

  return savedToken;
}

export async function validateRefreshToken(token: string): Promise<boolean> {
  const [dbToken] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token));

  if (!dbToken) return false;
  
  // Проверяем, не истек ли токен
  return dbToken.expiresAt > new Date();
}

export async function deleteRefreshToken(token: string) {
  await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
}

export async function deleteAllUserRefreshTokens(userId: string) {
  await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
}