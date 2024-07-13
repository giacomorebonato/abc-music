import { db } from '#/db/db'
import { dbEvents } from '#/db/db-events'
import { collabs } from '#/db/schema'

export function upsertCollab(params: { content: Buffer; id: string }) {
	const entry = db
		.insert(collabs)
		.values({
			id: params.id,
			content: params.content,
		})
		.onConflictDoUpdate({
			target: collabs.id,
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
	return db.query.collabs
		.findFirst({
			where: (collab, { eq }) => {
				return eq(collab.id, id)
			},
		})
		.sync()
}
