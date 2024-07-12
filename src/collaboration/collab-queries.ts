import { eq } from 'drizzle-orm'
import { db } from '#/db/db'
import { dbEvents } from '#/db/db-events'
import { collabTable } from '#/db/schema'

export function upsertCollab(params: { content: Buffer; id: string }) {
	const entry = db
		.insert(collabTable)
		.values({
			id: params.id,
			content: params.content,
		})
		.onConflictDoUpdate({
			target: collabTable.id,
			set: {
				content: params.content,
			},
		})
		.returning()
		.get()

	dbEvents.emit('upsertCollab', entry)

	return entry
}

export function getContentById(id: string) {
	return db.select().from(collabTable).where(eq(collabTable.id, id)).get()
}
