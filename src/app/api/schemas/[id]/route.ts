// src/app/api/schemas/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { schemas, tables, fields, relationships } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUserFromToken } from '@/lib/auth/from-token';
import { getUserFromRequest } from '@/lib/auth/get-user';


// PUT /api/schemas/[id] - обновить схему
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schemaId = id;
    const { name, description } = await request.json();
    
    const [editedSchema] = await db.update(schemas).set({
      name: name,
      description: description
    }).where(eq(schemas.id, schemaId)).returning();
    console.log(editedSchema.id === id)
    return NextResponse.json(editedSchema, { status: 200 })
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 500 })
  }
}

// DELETE /api/schemas/[id] - удалить схему
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params; 
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Вы не авторизованы' }, { status: 401 });
    }
    const schemaId = id;

    // Проверяем права доступа
    const [existingSchema] = await db.select().from(schemas).where(and(eq(schemas.id, schemaId), eq(schemas.userId, user.id)));
    
    if (!existingSchema) {
      return NextResponse.json({ error: 'Схема не найдена' }, { status: 404 });
    }
    await db.delete(schemas).where(eq(schemas.id, schemaId));
    return NextResponse.json({ message: 'Схема успешно удалена' });
  } catch (error) {
    console.error('Ошибка удаления схемы:', error);
    return NextResponse.json({ error: 'Ошибка удаления схемы' }, { status: 500 });
  }
}