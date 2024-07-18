import { createRouter as createReactRouter } from '@tanstack/react-router'
import { SuperJSON } from 'superjson'
import { routeTree } from '#/route-tree.gen'

export function createRouter() {
	return createReactRouter({
		transformer: SuperJSON,
		routeTree,
		context: {
			helmetContext: {},
			redirect: {},
		},
		defaultPreload: 'intent',
	})
}

declare module '@tanstack/react-router' {
	interface Register {
		router: ReturnType<typeof createRouter>
	}
}
