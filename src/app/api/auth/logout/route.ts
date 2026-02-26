// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { deleteRefreshToken } from '@/lib/auth/token-db';
import { getUserFromRequest } from '@/lib/auth/get-user';
import { deleteAllUserRefreshTokens } from '@/lib/auth/token-db';

export async function POST(request: Request) {
  try {
    const { refreshToken, logoutAll } = await request.json();
    const user = await getUserFromRequest();

    if (logoutAll && user) {
      // Выход со всех устройств
      await deleteAllUserRefreshTokens(user.id);
      return NextResponse.json({ message: 'Logged out from all devices' });
    }

    if (refreshToken) {
      // Выход только с текущего устройства
      await deleteRefreshToken(refreshToken);
      return NextResponse.json({ message: 'Logged out successfully' });
    }

    return NextResponse.json(
      { error: 'Refresh token is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}