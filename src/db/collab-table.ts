import { blob, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const collabTable = sqliteTable('collab', {
	id: text('id').primaryKey(),
	content: blob('content'),
})

export const insertCollabSchema = createInsertSchema(collabTable)
export const selectCollabSchema = createSelectSchema(collabTable)
