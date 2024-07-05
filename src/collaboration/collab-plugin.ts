import { Database } from '@hocuspocus/extension-database'
import { Logger } from '@hocuspocus/extension-logger'
import { Server as HocusPocusServer } from '@hocuspocus/server'
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { db } from '#/db/db'
import { collabTable } from '#/db/schema'

export const collabPlugin = (
	app: FastifyInstance,
	_options: unknown,
	done: () => void,
) => {
	const hocusPocusServer = HocusPocusServer.configure({
		extensions: [
			new Logger(),
			new Database({
				async fetch(data): Promise<Uint8Array | null> {
					app.log.info(`Fetching ${data.documentName} from collab table`)

					const file = db
						.select()
						.from(collabTable)
						.where(eq(collabTable.id, data.documentName))
						.get()

					if (!file) {
						app.log.info(`documentName ${data.documentName} not found`)

						return null
					}
					app.log.info(`documentName ${data.documentName} found`)

					return file?.content as Uint8Array
				},
				async store(data): Promise<void> {
					db.insert(collabTable)
						.values({
							id: data.documentName,
							content: data.state,
						})
						.onConflictDoUpdate({
							target: collabTable.id,
							set: {
								content: data.state,
							},
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
