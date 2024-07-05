import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { commonFields } from './common-fields'
import { userTable } from './user-table'

export const profileTable = sqliteTable('profile', {
	...commonFields,
	color: text('color'),
	nickname: text('nickname'),
	userId: text('user_id')
		.references(() => userTable.id)
		.unique(),
})

export const insertProfileSchema = createInsertSchema(profileTable)
export const selectProfileSchema = createSelectSchema(profileTable)
