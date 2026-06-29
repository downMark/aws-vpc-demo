import { pgTable, uuid, varchar, timestamp, boolean, text } from 'drizzle-orm/pg-core'

export const tokens = pgTable('tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  token: varchar('token', { length: 512 }).notNull(),
  githubLogin: varchar('github_login', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const operationLogs = pgTable('operation_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tokenId: uuid('token_id').references(() => tokens.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 50 }).notNull(),
  success: boolean('success').default(true).notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const testNotes = pgTable('test_notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 120 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Token = typeof tokens.$inferSelect
export type NewToken = typeof tokens.$inferInsert
export type OperationLog = typeof operationLogs.$inferSelect
export type NewOperationLog = typeof operationLogs.$inferInsert
export type TestNote = typeof testNotes.$inferSelect
export type NewTestNote = typeof testNotes.$inferInsert
