import * as Y from 'yjs'
import type { Collab } from '#/db/collab-table'
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

export function upsertPartiture(db: AbcDatabase, collab: Collab) {
	const buffer = collab.content as Buffer
	const ydoc = new Y.Doc()

	Y.applyUpdate(ydoc, buffer)

	const text = ydoc.getText('monaco').toJSON()
	const title = getTitle(text)

	const entry = db
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
