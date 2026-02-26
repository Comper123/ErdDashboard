// src/app/api/schemas/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { schemas, tables, fields, relationships } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUserFromToken } from '@/lib/auth/from-token';

// GET /api/schemas/[id] - получить конкретную схему со всеми данными
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schemaId = params.id;

    // Проверяем, принадлежит ли схема пользователю
    const [schema] = await db
      .select()
      .from(schemas)
      .where(and(eq(schemas.id, schemaId), eq(schemas.userId, user.userId)));

    if (!schema) {
      return NextResponse.json(
        { error: 'Schema not found' },
        { status: 404 }
      );
    }

    // Получаем все таблицы схемы
    const schemaTables = await db
      .select()
      .from(tables)
      .where(eq(tables.schemaId, schemaId));

    // Получаем все поля для каждой таблицы
    const tablesWithFields = await Promise.all(
      schemaTables.map(async (table) => {
        const tableFields = await db
          .select()
          .from(fields)
          .where(eq(fields.tableId, table.id))
          .orderBy(fields.position);
        
        return {
          ...table,
          fields: tableFields,
        };
      })
    );

    // Получаем все связи
    const schemaRelationships = await db
      .select()
      .from(relationships)
      .where(
        and(
          eq(relationships.fromTableId, schemaTables[0]?.id)
        )
      );

    return NextResponse.json({
      ...schema,
      tables: tablesWithFields,
      relationships: schemaRelationships,
    });
  } catch (error) {
    console.error('Error fetching schema:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/schemas/[id] - обновить схему
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schemaId = params.id;
    const { name, description } = await request.json();

    // Проверяем права доступа
    const [existingSchema] = await db
      .select()
      .from(schemas)
      .where(and(eq(schemas.id, schemaId), eq(schemas.userId, user.userId)));

    if (!existingSchema) {
      return NextResponse.json(
        { error: 'Schema not found' },
        { status: 404 }
      );
    }

    const [updatedSchema] = await db
      .update(schemas)
      .set({
        name: name || existingSchema.name,
        description: description !== undefined ? description : existingSchema.description,
        updatedAt: new Date(),
      })
      .where(eq(schemas.id, schemaId))
      .returning();

    return NextResponse.json(updatedSchema);
  } catch (error) {
    console.error('Error updating schema:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/schemas/[id] - удалить схему
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schemaId = params.id;

    // Проверяем права доступа
    const [existingSchema] = await db
      .select()
      .from(schemas)
      .where(and(eq(schemas.id, schemaId), eq(schemas.userId, user.userId)));

    if (!existingSchema) {
      return NextResponse.json(
        { error: 'Schema not found' },
        { status: 404 }
      );
    }

    await db.delete(schemas).where(eq(schemas.id, schemaId));

    return NextResponse.json({ message: 'Schema deleted successfully' });
  } catch (error) {
    console.error('Error deleting schema:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}