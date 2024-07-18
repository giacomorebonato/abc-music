import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import {
	Outlet,
	ScrollRestoration,
	createRootRouteWithContext,
} from '@tanstack/react-router'

import { Helmet } from 'react-helmet-async'
import { HelmetProvider } from 'react-helmet-async'
import type { HelmetServerState } from 'react-helmet-async'
import { createLink, trpcClient } from '#/browser/trpc-client'
import { ClientOnly } from '#/server/client-only'
import { useCustomMeta } from '#/server/use-custom-meta'
import type { RouterContext } from '#/types/router-context'

export const Route = createRootRouteWithContext<RouterContext>()({
	loader({ context }) {
		return { helmetContext: context?.helmetContext ?? {} }
	},
	component: RootComponent,
})

const queryClient = new QueryClient()
const apiClient = trpcClient.createClient({
	links: [createLink()],
})

function RootComponent() {
	const loaderData = Route.useLoaderData<{
		helmetContext: { helmet: HelmetServerState }
	}>()
	const customMeta = useCustomMeta()

	return (
		<HelmetProvider context={loaderData?.helmetContext || {}}>
			<Helmet>
				{/* Do not remove or it'll break hydration */}
				<script>{customMeta}</script>
			</Helmet>
			<trpcClient.Provider client={apiClient} queryClient={queryClient}>
				<QueryClientProvider client={queryClient}>
					<Outlet />

					<ClientOnly load={() => import('#/browser/pwa-reload-prompt')}>
						{(MyComponent) => <MyComponent />}
					</ClientOnly>
				</QueryClientProvider>
				<ScrollRestoration />
			</trpcClient.Provider>
		</HelmetProvider>
	)
}
