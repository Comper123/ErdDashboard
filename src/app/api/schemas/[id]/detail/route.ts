// src/app/api/schemas/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { schemas, tables, fields, relationships } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSessionFromCookie } from '@/lib/auth/sessions';


// GET /api/schemas/[id]/detail - получить конкретную схему
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Получаем пользователя из токена
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 1. Получаем основную информацию о схеме
    const [schema] = await db
      .select()
      .from(schemas)
      .where(and(
        eq(schemas.id, id),
        eq(schemas.userId, session.user.id) // Проверяем, что схема принадлежит пользователю
      ));

    if (!schema) {
      return NextResponse.json(
        { error: 'Схема не найдена' },
        { status: 404 }
      );
    }

    // 2. Получаем все таблицы схемы
    // 3. Получаем все поля для каждой таблицы
    // 4. Получаем все связи

    // 5. Формируем ответ
    return NextResponse.json({
      id: schema.id,
      name: schema.name,
      description: schema.description
    });

  } catch (error) {
    console.error('Ошибка при получении схемы:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params } : { params : Promise<{id: string}>}
){
  const { id } = await params;
  const { newTable } = await request.json();

  const createdTable = await db.insert(tables).values({
    schemaId: id,
    name: newTable.name,
    positionX: newTable.position.x,
    positionY: newTable.position.y
  }).returning()

  console.log("Созданная таблица: ", createdTable);

  // const createdFields = await db.insert(tables).values(newTable.map(field => {
  //   tableId: createdTable.id
  // }))

  return NextResponse.json({ error: ''}, { status: 500 })
}