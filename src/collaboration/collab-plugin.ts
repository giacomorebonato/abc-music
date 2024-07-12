import { Database } from '@hocuspocus/extension-database'
import { Logger } from '@hocuspocus/extension-logger'
import { Server as HocusPocusServer } from '@hocuspocus/server'
import type { FastifyInstance } from 'fastify'
import { getContentById, upsertCollab } from './collab-queries'

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
					const file = getContentById(data.documentName)

					return (file?.content as Uint8Array) ?? null
				},
				async store(data): Promise<void> {
					upsertCollab({
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
