import { createFileRoute } from '@tanstack/react-router'
import { Helmet } from 'react-helmet-async'
import { z } from 'zod'
import { Layout } from '#/browser/layout'
import { trpcClient } from '#/browser/trpc-client'

const validateSearch = z.object({
	page: z.number().default(0),
	text: z.string().optional(),
})

export const Route = createFileRoute('/partitures')({
	validateSearch,
	component: Partitures,
})

function Partitures() {
	const { page, text } = Route.useSearch()
	const partitures = trpcClient.partiture.list.useQuery({
		page,
		text,
	})

	return (
		<Layout>
			<Helmet>
				<title>abc-music - partitures</title>
				<meta
					name='description'
					content='Collaborative text editor for ABC music notation.'
				/>
				<link rel='canonical' href='https://abc-music.fly.dev/' />
			</Helmet>
			<main>
				{partitures.data?.map((partiture) => {
					return <div key={partiture.id}>{partiture.title}</div>
				})}
			</main>
		</Layout>
	)
}
