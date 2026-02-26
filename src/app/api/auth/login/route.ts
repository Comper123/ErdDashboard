// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { getUserByEmail, validatePassword } from '@/lib/utils/db-helpers';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import { saveRefreshToken } from '@/lib/auth/token-db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Валидация
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Пропущены данные для входа' },
        { status: 400 }
      );
    }

    // Ищем пользователя
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Такого пользователя не существует' },
        { status: 401 }
      );
    }

    // Проверяем пароль
    const isValidPassword = await validatePassword(user, password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Неверный пароль' },
        { status: 401 }
      );
    }

    // Генерируем токены
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // Сохраняем refresh token в БД
    await saveRefreshToken(user.id, refreshToken);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}