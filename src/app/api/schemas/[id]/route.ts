// src/app/api/schemas/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { schemas, tables, fields, relationships } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUserFromToken } from '@/lib/auth/from-token';

// GET /api/schemas/[id] - получить конкретную схему со всеми данными
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; 
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schemaId = id;

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { id } = await params;
    const { name, description, tables: newTables, relationships: newRelationships } = await request.json();

    // Проверяем права доступа
    const [existingSchema] = await db
      .select()
      .from(schemas)
      .where(and(eq(schemas.id, id), eq(schemas.userId, user.userId)));

    if (!existingSchema) {
      return NextResponse.json(
        { error: 'Схема не найдена' },
        { status: 404 }
      );
    }

    // Обновляем основную информацию схемы
    await db
      .update(schemas)
      .set({
        name: name || existingSchema.name,
        description: description !== undefined ? description : existingSchema.description,
        updatedAt: new Date(),
      })
      .where(eq(schemas.id, id));

    // Если переданы таблицы, обновляем их
    if (newTables) {
      // Удаляем старые таблицы и поля
      const oldTables = await db.select().from(tables).where(eq(tables.schemaId, id));
      for (const table of oldTables) {
        await db.delete(fields).where(eq(fields.tableId, table.id));
      }
      await db.delete(tables).where(eq(tables.schemaId, id));

      // Создаем новые таблицы и поля
      for (const table of newTables) {
        const [newTable] = await db
          .insert(tables)
          .values({
            id: table.id,
            schemaId: id,
            name: table.name,
            positionX: table.positionX.toString(),
            positionY: table.positionY.toString(),
            config: table.config || {},
          })
          .returning();

        // Создаем поля для таблицы
        for (const field of table.fields) {
          await db.insert(fields).values({
            id: field.id,
            tableId: newTable.id,
            name: field.name,
            type: field.type,
            isPrimaryKey: field.isPrimaryKey,
            isNullable: field.isNullable,
            isUnique: field.isUnique,
            defaultValue: field.defaultValue,
          });
        }
      }
    }

    // Если переданы связи, обновляем их
    if (newRelationships) {
      await db.delete(relationships).where(eq(relationships.fromTableId, id));
      
      for (const rel of newRelationships) {
        await db.insert(relationships).values({
          id: rel.id,
          fromTableId: rel.fromTableId,
          fromFieldId: rel.fromFieldId,
          toTableId: rel.toTableId,
          toFieldId: rel.toFieldId,
          type: rel.type,
          config: {},
        });
      }
    }

    return NextResponse.json({ message: 'Схема обновлена' });
  } catch (error) {
    console.error('Ошибка при обновлении схемы:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
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
    const { id } = await params; 
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schemaId = id;

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