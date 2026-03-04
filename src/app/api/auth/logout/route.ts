// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { deleteRefreshToken } from '@/lib/auth/token-db';
import { getUserFromRequest } from '@/lib/auth/get-user';
import { deleteAllUserRefreshTokens } from '@/lib/auth/token-db';
import { deleteSession, getSessionFromCookie, removeSessionCookie } from '@/lib/auth/sessions';

export async function POST(request: NextRequest) {
  try {
    // const { refreshToken, logoutAll } = await request.json();
    // const user = await getUserFromRequest(request);
    const sessionData = await getSessionFromCookie();

    if (sessionData) {
      // Удаляем сессию из БД
      await deleteSession(sessionData.session.sessionToken);
    }

    // Удаляем cookie
    removeSessionCookie();
    
    // if (logoutAll && user) {
    //   // Выход со всех устройств
    //   await deleteAllUserRefreshTokens(user.id);
    //   return NextResponse.json({ message: 'Logged out from all devices' });
    // }

    // if (refreshToken) {
    //   // Выход только с текущего устройства
    //   await deleteRefreshToken(refreshToken);
    //   return NextResponse.json({ message: 'Logged out successfully' });
    // }

    // return NextResponse.json(
    //   { error: 'Refresh token не передан' },
    //   { status: 400 }
    // );
    return NextResponse.json(
      { error: 'Успешный выход' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}