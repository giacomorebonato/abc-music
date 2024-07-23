import type { CollabSchema } from '#/db/collab-table'
import type { AbcDatabase, DbEvents } from '#/db/db-plugin'
import { collabs } from '#/db/schema'

export class CollabQueries {
	constructor(
		private db: AbcDatabase,
		private dbEvents: DbEvents,
	) {}

	upsert(collab: Pick<CollabSchema, 'id'> & Partial<CollabSchema>) {
		const entry = this.db
			.insert(collabs)
			.values({
				id: collab.id,
				content: collab.content,
			})
			.onConflictDoUpdate({
				target: collabs.id,
				set: {
					content: collab.content,
				},
			})
			.returning()
			.get() as CollabSchema

		this.dbEvents.emit('upsertCollab', entry)

		return entry
	}

	byId(id: string) {
		return this.db.query.collabs
			.findFirst({
				where: (collab, { eq }) => {
					return eq(collab.id, id)
				},
			})
			.sync()
	}
}
