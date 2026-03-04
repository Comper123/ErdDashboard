import { randomUUID } from "crypto";
import { db } from "../db";
import { sessions, users } from "../db/schema";
import { eq, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";



// Конфигурация сессий
export const sessionConfig = {
  sessionDuration: 7 * 24 * 60 * 60 * 1000, // 7 дней в миллисекундах
  inactivityTimeout: 30 * 60 * 1000, // 30 минут
  cookieName: 'auth_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  },
};

// Генерация UUID v4 (практически гарантирует уникальность)
export function generateUUIDToken(): string {
  return randomUUID();
}

// Создание сессии с UUID
export async function createSession(
  userId: string,
  userAgent?: string,
  ipAddress?: string
) {
  const sessionToken = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  try {
    const [session] = await db.insert(sessions).values({
      userId,
      sessionToken,
      expiresAt,
      userAgent,
      ipAddress,
      lastActivity: new Date(),
    }).returning();

    return session;
  } catch (error: any) {
    // На случай маловероятной коллизии UUID
    if (error.code === '23505') { // PostgreSQL unique violation code
      console.log('Коллизия UUID, пробуем еще раз...');
      return createSession(userId, userAgent, ipAddress);
    }
    throw error;
  }
}

// Получение сессии по токену
export async function getSessionByToken(sessionToken: string){
    const [session] = await db.select().from(sessions).where(eq(sessions.sessionToken, sessionToken));
    return session;
}

// Получение сессии с пользователем
export async function getSessionWithUser(sessionToken: string) {
  const result = await db.select({session: sessions, user: users})
    .from(sessions).innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.sessionToken, sessionToken));

  return result[0];
}

// Обновление активности сессии
export async function updateSessionActivity(sessionToken: string) {
  await db.update(sessions)
    .set({ lastActivity: new Date() })
    .where(eq(sessions.sessionToken, sessionToken));
}

// Удаление сессии
export async function deleteSession(sessionToken: string) {
  await db
    .delete(sessions)
    .where(eq(sessions.sessionToken, sessionToken));
}

// Очистка истекших сессий
export async function cleanupExpiredSessions() {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}

// Проверка валидности сессии
export function isSessionValid(session: typeof sessions.$inferSelect): boolean {
  const now = new Date();
  return session.expiresAt > now;
}

// Проверка активности сессии
export function isSessionActive(
  session: typeof sessions.$inferSelect,
  maxInactivity: number = sessionConfig.inactivityTimeout
): boolean {
  const now = new Date();
  const lastActivity = new Date(session.lastActivity);
  return now.getTime() - lastActivity.getTime() < maxInactivity;
}

// Получение сессии из cookie в App Router
export async function getSessionFromCookie(){
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(sessionConfig.cookieName)?.value;
    // console.log("Токен: ", sessionToken);
    if (!sessionToken) return null;
    const sessionData = await getSessionWithUser(sessionToken);
    if (!sessionData) return null;

    const { session, user } = sessionData;

    // Проверяем валидность сессии
    if (!isSessionValid(session)) {
        await deleteSession(sessionToken);
        return null;
    }

    // Проверяем активность
    if (!isSessionActive(session)) {
        await deleteSession(sessionToken);
        return null;
    }
    // Обновляем активность
    await updateSessionActivity(sessionToken);

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
        session,
    };
}

// Установка cookie сессии
export async function setSessionCookie(sessionToken: string) {
    const cookieStore = await cookies();
    cookieStore.set(
        sessionConfig.cookieName,
        sessionToken,
        {
            ...sessionConfig.cookieOptions,
            maxAge: sessionConfig.sessionDuration / 1000
        }
    )
    // console.log(cookieStore.get(sessionConfig.cookieName));
}

// Удаление cookie сессии
export async function removeSessionCookie(){
    (await cookies()).delete(sessionConfig.cookieName);
}

// Middleware версия для получения сессии из NextRequest
export async function getSessionFromRequest(request: NextRequest){
    const sessionToken = request.cookies.get(sessionConfig.cookieName)?.value;
    if (!sessionToken) return null;

    const sessionData = await getSessionWithUser(sessionToken);
    if (!sessionData) return null;

    const { session, user } = sessionData;
    if (!isSessionValid(session) || !isSessionActive(session)) {
        await deleteSession(sessionToken);
        return null;
    }
    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        },
        session,
    };
}