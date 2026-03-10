import { getSessionFromCookie } from "@/lib/auth/sessions";
import { db } from "@/lib/db";
import { fields, tables } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";


// GET /api/schemas/[id]/detail/table - создать таблицу
export async function POST(
  request: NextRequest,
  { params } : { params : Promise<{id: string}>}
){
  // Получаем пользователя из токена
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json(
      { error: 'Не авторизован' },
      { status: 401 }
    );
  }

  const { id } = await params;
  const { table } = await request.json();
  const newTable = table;

  const createdTable = await db.insert(tables).values({
    schemaId: id,
    name: newTable.name,
    positionX: newTable.position.x,
    positionY: newTable.position.y
  }).returning()

  console.log("Созданная таблица: ", createdTable);

  if (newTable.fields && newTable.fields.length > 0) {
    const fieldsToInsert = newTable.fields.map(field => ({
      tableId: createdTable[0].id,
      name: field.name,
      type: field.type,
      isPrimaryKey: field.isPrimaryKey || false,
      isNullable: field.isNullable || true,
      isUnique: field.isUnique || false,
      defaultValue: field.defaultValue.toString() || null,
      position: field.position || 0
    }));
    const insertingFields = await db.insert(fields).values(fieldsToInsert).returning();
    console.log("Созданные поля: ", insertingFields);
  }

  return NextResponse.json(newTable, { status: 200 })
}