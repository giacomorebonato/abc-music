import { Database } from '@hocuspocus/extension-database'
import { Logger } from '@hocuspocus/extension-logger'
import { Server as HocusPocusServer } from '@hocuspocus/server'
import type { FastifyInstance } from 'fastify'
import { CollabQueries } from './collab-queries'

export const collabPlugin = (
	app: FastifyInstance,
	_options: unknown,
	done: () => void,
) => {
	const collabQueries = new CollabQueries(app.db, app.dbEvents)
	const hocusPocusServer = HocusPocusServer.configure({
		extensions: [
			new Logger(),
			new Database({
				async fetch(data): Promise<Uint8Array | null> {
					const file = collabQueries.byId(data.documentName)

					return (file?.content as Uint8Array) ?? null
				},
				async store(data): Promise<void> {
					collabQueries.upsert({
						content: data.state,
						id: data.documentName,
					})
				},
			}),
		],
	})

	app.get('/collab/:docName', { websocket: true }, (connection, request) => {
		hocusPocusServer.handleConnection(connection, request.raw)
	})

	done()
}
