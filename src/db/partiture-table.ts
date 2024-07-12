import { relations } from 'drizzle-orm'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { collabTable } from './collab-table'
import { commonFields } from './common-fields'

export const partitureTable = sqliteTable('partiture', {
	...commonFields,
	title: text('title'),
	collabId: text('collab_id').notNull().unique(),
})

export const insertPartitureSchema = createInsertSchema(partitureTable)
export const selectPartitureSchema = createSelectSchema(partitureTable)

export const partitureRelations = relations(partitureTable, ({ one }) => ({
	collab: one(collabTable, {
		relationName: 'collab',
		fields: [partitureTable.collabId],
		references: [collabTable.id],
	}),
}))
