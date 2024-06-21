import Path from 'node:path'
import { createClient } from '@libsql/client'
import appRootPath from 'app-root-path'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { env } from '#/server/env'

const client = createClient({
	url: env.DATABASE_URL,
})

export const db = drizzle(client)

migrate(db, { migrationsFolder: Path.join(appRootPath.path, 'migrations') })
