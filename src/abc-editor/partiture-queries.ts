import * as Y from 'yjs'
import type { CollabSchema } from '#/db/collab-table'
import type { AbcDatabase } from '#/db/db-plugin'
import { partitures } from '#/db/schema'

function getTitle(text: string) {
	const lines = text.split('\n')
	let title = 'anonymous'

	for (const line of lines) {
		if (line.trim().startsWith('T:')) {
			title = line.slice(2)
			break
		}
	}

	return title
}

export class PartitureQueries {
	constructor(private db: AbcDatabase) {}

	upsertFromCollab(
		collab: Required<Pick<CollabSchema, 'id'>> & Partial<CollabSchema>,
	) {
		const buffer = collab.content
		const ydoc = new Y.Doc()

		Y.applyUpdate(ydoc, buffer as Uint8Array)

		const text = ydoc.getText('monaco').toJSON()
		const title = getTitle(text)

		const entry = this.db
			.insert(partitures)
			.values({
				collabId: collab.id,
				title,
			})
			.onConflictDoUpdate({
				target: partitures.collabId,
				set: {
					title: title.trim(),
				},
			})
			.returning()
			.get()

		return entry
	}

	byCollabId(collabId: string) {
		return this.db.query.partitures
			.findFirst({
				where: (partiture, { eq }) => {
					return eq(partiture.collabId, collabId)
				},
			})
			.sync()
	}

	byId(id: string) {
		return this.db.query.partitures
			.findFirst({
				where: (partiture, { eq }) => {
					return eq(partiture.id, id)
				},
			})
			.sync()
	}
}
