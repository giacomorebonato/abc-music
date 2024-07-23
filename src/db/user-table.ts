import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { commonFields } from './common-fields'

export const userTable = sqliteTable('user', {
	...commonFields,
	color: text('color'),
	nickname: text('nickname'),
	email: text('email').unique(),
	lastLoginAt: integer('updated_at', { mode: 'timestamp' }),
})

export type UserSchema = typeof userTable.$inferSelect
export const insertUserSchema = createInsertSchema(userTable)
export const selectUserSchema = createSelectSchema(userTable)
