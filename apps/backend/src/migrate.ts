import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db } from './db/index.js'

export async function handler() {
  await migrate(db, { migrationsFolder: './drizzle' })
  return { ok: true }
}
