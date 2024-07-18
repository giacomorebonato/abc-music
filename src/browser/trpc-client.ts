import {
	createTRPCReact,
	createWSClient,
	httpBatchLink,
	splitLink,
	wsLink,
} from '@trpc/react-query'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { SuperJSON } from 'superjson'
import type { ApiRouter } from '#/server/trpc-routes'

export const trpcClient = createTRPCReact<ApiRouter>()

const getProtocol = (
	type: 'http' | 'ws' = 'http',
): 'http' | 'https' | 'ws' | 'wss' => {
	if (import.meta.env.PROD && window?.location.protocol === 'https:') {
		return `${type}s`
	}

	return type
}

export function createLink() {
	if (import.meta.env.SSR) {
		return httpBatchLink({
			transformer: SuperJSON,
			url: `${process.env.SITE_URL}/trpc`,
		})
	}

	const wsUrl = `${getProtocol('ws')}://${window.location.host}/trpc`
	const httpUrl = `${getProtocol('http')}://${window.location.host}/trpc`

	const wsClient = createWSClient({ url: wsUrl })

	return splitLink({
		condition(op) {
			return op.type === 'subscription'
		},
		true: wsLink<ApiRouter>({
			client: wsClient,
			transformer: SuperJSON,
		}),
		false: httpBatchLink({ url: httpUrl, transformer: SuperJSON }),
	})
}

export type RouterInput = inferRouterInputs<ApiRouter>
export type RouterOutput = inferRouterOutputs<ApiRouter>
