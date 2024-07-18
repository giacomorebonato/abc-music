import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { type FastifyServerOptions, fastify } from 'fastify'
import { googleAuth } from '#/auth/google-auth'
import { collabPlugin } from '#/collaboration/collab-plugin'
import { env } from './env'
import { createTrpcContext } from './trpc-context'
import { apiRouter } from './trpc-routes'

export async function createServer(
	options: FastifyServerOptions = {
		logger: true,
		maxParamLength: 5_000,
	},
) {
	const server = fastify(options)

	await server
		.register(import('#/db/db-plugin'), {
			dbUrl: env.DATABASE_URL,
		})
		.register(import('./redirect-plugin'), {
			hostNamesRedirectFrom: env.HOST_NAMES_REDIRECT_FROM,
			hostNameRedirectTo: env.SITE_URL,
		})
		.register(import('./vite-plugin'))
		.register(import('@fastify/cookie'), {
			hook: 'onRequest',
			secret: env.SECRET,
		})
		.register(import('@fastify/websocket'))
		.register(googleAuth, {
			GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
			GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
		})
		.register(fastifyTRPCPlugin, {
			prefix: '/trpc',
			trpcOptions: {
				createContext: createTrpcContext(server),
				router: apiRouter,
			},
			useWSS: true,
		})
		.register(collabPlugin)
		.ready()

	return await server
}

export type AbcServer = Awaited<ReturnType<typeof createServer>>
