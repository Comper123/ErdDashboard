import { getSessionFromRequest } from "@/lib/auth/sessions";
import { db } from "@/lib/db";
import { tables } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";


export async function POST(
    request: NextRequest,
    { params } : { params: Promise<{ id: string }>}
){
    const session = await getSessionFromRequest(request);
    if (!session) {
        return Response.json({ error: "Вы не авторизованы" }, { status: 401 })
    }
    const { id } = await params;
    const { newX, newY } = await request.json();
    await db.update(tables).set({ positionX: newX, positionY: newY}).where(eq(tables.id, id));
    return Response.json({ status: 204 })
}