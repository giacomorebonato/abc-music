import type { AbcDatabase, DbEvents } from '#/db/db-plugin'
import { collabs } from '#/db/schema'

export function upsertCollab(
	{ db, dbEvents }: { db: AbcDatabase; dbEvents: DbEvents },
	params: { content: Buffer; id: string },
) {
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

export function getContentById(db: AbcDatabase, id: string) {
	return db.query.collabs
		.findFirst({
			where: (collab, { eq }) => {
				return eq(collab.id, id)
			},
		})
		.sync()
}
