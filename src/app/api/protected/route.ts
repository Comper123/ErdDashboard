// src/app/api/protected/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/get-user';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: 'This is protected data',
      user,
    });
  } catch (error) {
    console.error('Protected route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}