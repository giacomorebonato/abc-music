import { Database } from '@hocuspocus/extension-database'
import { Server as HocusPocusServer } from '@hocuspocus/server'
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import * as Y from 'yjs'
import { db } from '#/db/db'
import { collabSchema } from '#/db/schema'

export const collabPlugin = (
	app: FastifyInstance,
	_options: unknown,
	done: () => void,
) => {
	const hocusPocusServer = HocusPocusServer.configure({
		extensions: [
			new Database({
				async fetch(data): Promise<Uint8Array> {
					app.log.info(`Fetching ${data.documentName} from collab table`)

					const file = await db
						.select()
						.from(collabSchema)
						.where(eq(collabSchema.id, data.documentName))
						.get()

					if (!file) {
						app.log.info(`documentName ${data.documentName} not found`)

						const ydoc = new Y.Doc()
						const content = Y.encodeStateAsUpdateV2(ydoc)
						await db
							.insert(collabSchema)
							.values({
								id: data.documentName,
							})
							.run()

						return content
					}
					app.log.info(`documentName ${data.documentName} found`)

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
