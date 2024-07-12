import * as Y from 'yjs'
import type { Collab } from '#/db/collab-table'
import { db } from '#/db/db'
import { partitureTable } from '#/db/schema'

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

export function upsertPartiture(collab: Collab) {
	const buffer = collab.content as Buffer
	const ydoc = new Y.Doc()

	Y.applyUpdate(ydoc, buffer)

	const text = ydoc.getText('monaco').toJSON()
	const title = getTitle(text)

	const entry = db
		.insert(partitureTable)
		.values({
			collabId: collab.id,
			title,
		})
		.onConflictDoUpdate({
			target: partitureTable.collabId,
			set: {
				title,
			},
		})
		.returning()
		.get()

	return entry
}
