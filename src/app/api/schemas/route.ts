// src/app/api/schemas/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { schemas, tables, fields, relationships } from '@/lib/db/schema';
import { getUserFromToken } from '@/lib/auth/from-token';
import { eq, and, desc } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth/get-user';

// GET /api/schemas - получить все схемы пользователя
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userSchemas = await db
      .select({
        id: schemas.id,
        name: schemas.name,
        description: schemas.description,
        createdAt: schemas.createdAt,
        updatedAt: schemas.updatedAt,
        tablesCount: db.$count(tables, eq(tables.schemaId, schemas.id)),
      })
      .from(schemas)
      .where(eq(schemas.userId, user.id))
      .orderBy(desc(schemas.updatedAt));

    return NextResponse.json(userSchemas);
  } catch (error) {
    console.error('Error fetching schemas:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/schemas - создать новую схему
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Schema name is required' },
        { status: 400 }
      );
    }

    const [newSchema] = await db
      .insert(schemas)
      .values({
        userId: user.userId,
        name,
        description,
      })
      .returning();

    return NextResponse.json(newSchema, { status: 201 });
  } catch (error) {
    console.error('Error creating schema:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}