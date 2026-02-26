// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from './lib/auth/jwt';

// Пути, которые не требуют авторизации
const publicPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/',
  '/login',
];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Пропускаем публичные пути
  if (publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next();
  }

  // Проверяем наличие токена
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!token) {
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Верифицируем токен
  const payload = verifyAccessToken(token);
  
  if (!payload) {
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Для API роутов добавляем заголовки
  if (path.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId);
    response.headers.set('x-user-email', payload.email);
    return response;
  }

  // Для страниц добавляем куки или продолжаем без изменений
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
  ],
};