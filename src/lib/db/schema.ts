// src/lib/db/schema.ts
import { pgTable, uuid, varchar, timestamp, text, json, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { unique } from 'drizzle-orm/pg-core';


// Создаем ENUM тип в PostgreSQL
export const fieldTypeEnum = pgEnum('field_type', [
  'int', 'bigint', 'smallint', 'serial',
  'decimal', 'float', 'double',
  'varchar', 'text', 'char',
  'boolean',
  'date', 'timestamp', 'time', 'interval',
  'uuid',
  'json', 'blob', 'jsonb',
  'array', 'enum'
]);

// Создаем ENUM тип для связей
export const relationTypeEnum = pgEnum('relation_type', [
  'one-to-one',
  'one-to-many',
  'many-to-one',
  'many-to-many'
])

// Пользователи
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  isActive : boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Сессии
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address', { length: 45 }),
  lastActivity: timestamp('last_activity').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Токены для refresh
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Схемы баз данных (проекты)
export const schemas = pgTable('schemas', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (schema) => ({
  // Составной уникальный индекс: имя должно быть уникальным только для конкретного пользователя
  uniqueNamePerUser: unique('unique_name_per_user').on(schema.userId, schema.name)
}));

// Таблицы в схемах
export const tables = pgTable('tables', {
  id: uuid('id').defaultRandom().primaryKey(),
  schemaId: uuid('schema_id').references(() => schemas.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  positionX: varchar('position_x').default('0'), // храним как строку для точности
  positionY: varchar('position_y').default('0'),
  config: json('config').default({}), // цвет, размер и т.д.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Составной уникальный индекс: имя таблицы должно быть уникальным
  uniqueNamePerSchema: unique('unique_name_per_schema').on(table.schemaId, table.name)
}));

// Поля таблиц
export const fields = pgTable('fields', {
  id: uuid('id').defaultRandom().primaryKey(),
  tableId: uuid('table_id').references(() => tables.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: fieldTypeEnum('type').notNull(), // используем enum 
  isPrimaryKey: boolean('is_primary_key').default(false),
  isNullable: boolean('is_nullable').default(true),
  isUnique: boolean('is_unique').default(false),
  defaultValue: text('default_value'),
  position: varchar('position').default('0'), // порядок отображения
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (field) => ({
  uniqueFieldPerSchema: unique('unique_field_per_schema').on(field.tableId, field.name)
}));

// Связи между таблицами
export const relationships = pgTable('relationships', {
  id: uuid('id').defaultRandom().primaryKey(),
  fromTableId: uuid('from_table_id').references(() => tables.id, { onDelete: 'cascade' }).notNull(),
  fromFieldId: uuid('from_field_id').references(() => fields.id, { onDelete: 'cascade' }),
  toTableId: uuid('to_table_id').references(() => tables.id, { onDelete: 'cascade' }).notNull(),
  toFieldId: uuid('to_field_id').references(() => fields.id, { onDelete: 'cascade' }),
  type: relationTypeEnum('type').notNull(), // 'one-to-one', 'one-to-many', 'many-to-many', 'many-to-one
  config: json('config').default({}), // дополнительные настройки связи
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations для удобной работы с Drizzle
export const usersRelations = relations(users, ({ many }) => ({
  refreshTokens: many(refreshTokens),
  schemas: many(schemas),
  sessions: many(sessions)
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const schemasRelations = relations(schemas, ({ one, many }) => ({
  user: one(users, {
    fields: [schemas.userId],
    references: [users.id],
  }),
  tables: many(tables),
}));

export const tablesRelations = relations(tables, ({ one, many }) => ({
  schema: one(schemas, {
    fields: [tables.schemaId],
    references: [schemas.id],
  }),
  fields: many(fields),
  fromRelationships: many(relationships, { relationName: 'fromTable' }),
  toRelationships: many(relationships, { relationName: 'toTable' }),
}));

export const fieldsRelations = relations(fields, ({ one }) => ({
  table: one(tables, {
    fields: [fields.tableId],
    references: [tables.id],
  }),
}));

export const relationshipsRelations = relations(relationships, ({ one }) => ({
  fromTable: one(tables, {
    fields: [relationships.fromTableId],
    references: [tables.id],
    relationName: 'fromTable',
  }),
  fromField: one(fields, {
    fields: [relationships.fromFieldId],
    references: [fields.id],
  }),
  toTable: one(tables, {
    fields: [relationships.toTableId],
    references: [tables.id],
    relationName: 'toTable',
  }),
  toField: one(fields, {
    fields: [relationships.toFieldId],
    references: [fields.id],
  }),
}));