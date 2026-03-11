import { getSessionFromRequest } from "@/lib/auth/sessions";
import { db } from "@/lib/db";
import { schemas, tables } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(
    request: NextRequest,
    { params } : { params : Promise<{ id: string}>}
){
    const { id } = await params;
    const session = await getSessionFromRequest(request);
    if (!session) {
        return NextResponse.json({ error: "Вы не авторизованы" }, { status: 401 })
    } 

    const [table] = await db.select().from(tables).where(eq(tables.id, id));
    if (!table) {
        return NextResponse.json({ error: "Такой таблицы не существует" }, { status: 500 })
    }
    const [schema] = await db.select().from(schemas).where(eq(schemas.id, table.schemaId));
    if (session.user.id !== schema.userId){
        return NextResponse.json({ error: "У вас нет прав на это действие" }, { status: 403 })
    }

    await db.delete(tables).where(eq(tables.id, id));
    return NextResponse.json({ status: 204 });
}