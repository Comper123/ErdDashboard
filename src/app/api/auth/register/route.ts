// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import { saveRefreshToken } from '@/lib/auth/token-db';
import { createUser, getUserByEmail } from '@/lib/utils/db-helpers';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Валидация
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Пароль и логин пропущены' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать не менее 6 символов' },
        { status: 400 }
      );
    }

    // Проверяем, не существует ли уже пользователь
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Такой пользователь уже существует' },
        { status: 409 }
      );
    }

    // Создаем пользователя
    const user = await createUser(email, password, name);

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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}