import Path from 'node:path'
import appRootPath from 'app-root-path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { env } from '#/server/env'
import * as schema from './schema'

const sqlite = new Database(env.DATABASE_URL)

sqlite.pragma('journal_mode = WAL')

export const db = drizzle(sqlite, { schema })

migrate(db, { migrationsFolder: Path.join(appRootPath.path, 'migrations') })
