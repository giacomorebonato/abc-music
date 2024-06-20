import { Database } from '@hocuspocus/extension-database'
import { Server as HocusPocusServer } from '@hocuspocus/server'
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import * as Y from 'yjs'
import { db } from '#/db/db'
import { collabSchema } from '#/db/schema'

const cooleyTxt = `X: 1
T: Cooley's
M: 4/4
L: 1/8
R: reel
K: Emin
|:D2|EB{c}BA B2 EB|~B2 AB dBAG|FDAD BDAD|FDAD dAFD|
EBBA B2 EB|B2 AB defg|afe^c dBAF|DEFD E2:|
|:gf|eB B2 efge|eB B2 gedB|A2 FA DAFA|A2 FA defg|
eB B2 eBgB|eB B2 defg|afe^c dBAF|DEFD E2:|
`

export const collabApi = (
	app: FastifyInstance,
	_options: unknown,
	done: () => void,
) => {
	const hocusPocusServer = HocusPocusServer.configure({
		extensions: [
			new Database({
				async fetch(data): Promise<Uint8Array> {
					const file = await db
						.select()
						.from(collabSchema)
						.where(eq(collabSchema.id, data.documentName))
						.get()

					if (!file) {
						const ydoc = new Y.Doc()
						const type = ydoc.getText('monaco')
						type.insert(0, cooleyTxt)

						const content = Y.encodeStateAsUpdateV2(ydoc)
						await db
							.insert(collabSchema)
							.values({
								id: data.documentName,
								content,
							})
							.run()

						return content
					}

					return file?.content as Uint8Array
				},
				store: async (data) => {
					await db
						.update(collabSchema)
						.set({
							id: data.documentName,
							content: data.state,
						})
						.run()
				},
			}),
		],
	})

	app.get('/collab/:docName', { websocket: true }, (connection, request) => {
		hocusPocusServer.handleConnection(connection, request.raw)
	})

	done()
}
