// src/lib/utils/db-helpers.ts
import { db } from '../db';
import { users, refreshTokens } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const [user] = await db.insert(users).values({
    email,
    password: hashedPassword,
    name,
  }).returning();
  
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function validatePassword(user: any, password: string) {
  return bcrypt.compare(password, user.password);
}