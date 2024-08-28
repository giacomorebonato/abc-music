import Crypto from 'node:crypto'
import type { CollabSchema } from '#/db/collab-table'
import type { AbcDatabase, DbEvents } from '#/db/db-plugin'
import { collabs } from '#/db/schema'

export class CollabQueries {
	constructor(
		private db: AbcDatabase,
		private dbEvents: DbEvents,
	) {}

	upsert(collab: Partial<CollabSchema>) {
		const id = collab.id ?? Crypto.randomUUID()
		const entry = this.db
			.insert(collabs)
			.values({
				...collab,
				id: id,
			})
			.onConflictDoUpdate({
				target: collabs.id,
				set: {
					content: collab.content,
				},
			})
			.returning()
			.get() as CollabSchema

		this.dbEvents.emit('UPSERT_COLLAB', entry)

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
