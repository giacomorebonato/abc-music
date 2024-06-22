import { Database } from '@hocuspocus/extension-database'
import { Logger } from '@hocuspocus/extension-logger'
import { Server as HocusPocusServer } from '@hocuspocus/server'
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { db } from '#/db/db'
import { collabSchema } from '#/db/schema'

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

					const file = await db
						.select()
						.from(collabSchema)
						.where(eq(collabSchema.id, data.documentName))
						.get()

					if (!file) {
						app.log.info(`documentName ${data.documentName} not found`)

						return null
					}
					app.log.info(`documentName ${data.documentName} found`)

					return file?.content as Uint8Array
				},
				async store(data) {
					await db
						.insert(collabSchema)
						.values({
							id: data.documentName,
							content: data.state,
						})
						.onConflictDoUpdate({
							target: collabSchema.id,
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
