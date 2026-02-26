// src/app/api/auth/refresh/route.ts
import { NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import { validateRefreshToken, saveRefreshToken, deleteRefreshToken } from '@/lib/auth/token-db';
import { getUserById } from '@/lib/utils/db-helpers';

export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Проверяем валидность refresh token в БД
    const isValidInDb = await validateRefreshToken(refreshToken);
    if (!isValidInDb) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Верифицируем токен
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Получаем актуальные данные пользователя
    const user = await getUserById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Удаляем старый refresh token
    await deleteRefreshToken(refreshToken);

    // Генерируем новые токены
    const newAccessToken = generateAccessToken({ userId: user.id, email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // Сохраняем новый refresh token
    await saveRefreshToken(user.id, newRefreshToken);

    return NextResponse.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}