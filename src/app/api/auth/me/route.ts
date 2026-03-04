import { getSessionFromCookie } from '@/lib/auth/sessions';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sessionData = await getSessionFromCookie();
    if (!sessionData) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: sessionData.user,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}