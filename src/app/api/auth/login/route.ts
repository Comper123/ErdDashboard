// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { getUserByEmail, validatePassword } from '@/lib/utils/db-helpers';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import { saveRefreshToken } from '@/lib/auth/token-db';
import { headers } from 'next/headers';
import { createSession, getSessionFromCookie, setSessionCookie } from '@/lib/auth/sessions';

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
    // const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    // const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // Сохраняем refresh token в БД
    // await saveRefreshToken(user.id, refreshToken);

    // Получение информации о клиенте
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || undefined;
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';

    // Создание сессии
    const session = await createSession(user.id, userAgent, ipAddress);
    // Установка cookie
    setSessionCookie(session.sessionToken);
    console.log("Cookie после установки: ", await getSessionFromCookie());

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}