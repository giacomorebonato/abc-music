import { blob, sqliteTable } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { commonFields } from './common-fields'

export const collabTable = sqliteTable('collab', {
	...commonFields,
	content: blob('content'),
})

export type CollabSchema = Omit<typeof collabTable.$inferSelect, 'content'> & {
	content: Uint8Array | Buffer
}
export const insertCollabSchema = createInsertSchema(collabTable)
export const selectCollabSchema = createSelectSchema(collabTable)
