import Crypto from 'node:crypto'
import { integer, text } from 'drizzle-orm/sqlite-core'

export const commonFields = {
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => {
		return new Date()
	}),
	id: text('id')
		.notNull()
		.primaryKey()
		.$defaultFn(() => {
			return Crypto.randomUUID()
		}),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => {
		return new Date()
	}),
} as const
