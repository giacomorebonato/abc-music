import Crypto from 'node:crypto'
import { expect, test } from 'vitest'
import * as Y from 'yjs'
import { createDb } from '#/db/db-plugin'
import { PartitureQueries } from '../partiture-queries'

const db = createDb(':memory')
const partitureQueries = new PartitureQueries(db)

test('creates partiture from collab', () => {
	const id = Crypto.randomUUID()
	const ydoc = new Y.Doc()

	const monaco = ydoc.getText('monaco')

	monaco.insert(0, `T:Grandma's Salty Crackers`)
	const content = Y.encodeStateAsUpdate(ydoc)

	partitureQueries.upsertFromCollab({
		id,
		content,
	})

	const newPartiture = partitureQueries.byCollabId(id)

	expect(newPartiture?.title).equals(`Grandma's Salty Crackers`)

	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	const newPartitureCopy = partitureQueries.byId(newPartiture!.id)

	expect(newPartitureCopy).toEqual(newPartiture)
})
