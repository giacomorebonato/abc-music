import { createFileRoute } from '@tanstack/react-router'
import type * as abc from 'abcjs'
import { Helmet } from 'react-helmet-async'
import { toast } from 'react-toastify'
import { useDebounceCallback } from 'usehooks-ts'
import type { MonacoBinding } from 'y-monaco'
import { z } from 'zod'
import { Layout } from '#/browser/layout'
import { trpcClient } from '#/browser/trpc-client'

export const Route = createFileRoute('/profile')({
	component: ProfileComponent,
})

declare global {
	interface Window {
		createSynth: abc.MidiBuffer
		monacoBinding: MonacoBinding
		tuneObject: abc.TuneObject
		synthControl: abc.SynthObjectController
	}
}

const formSchema = z.object({
	color: z.string(),
	nickname: z.string(),
})

function ProfileComponent() {
	const updateProfile = trpcClient.profile.updateProfile.useMutation({
		onSuccess() {
			toast('Profile saved', {
				position: 'bottom-right',
				autoClose: 1_000,
			})
		},
	})
	const updateProfileDebounce = useDebounceCallback(updateProfile.mutate, 500)
	const profile = trpcClient.profile.ownProfile.useQuery()

	return (
		<Layout>
			<Helmet>
				<title>abc-music</title>
				<meta
					name='description'
					content='Collaborative text editor for ABC music notation.'
				/>
				<link rel='canonical' href='https://abc-music.fly.dev/' />
			</Helmet>

			<main>
				<form
					className='mx-auto container p-2 grid grid-cols-1 max-w-screen-sm'
					onChange={(e) => {
						// biome-ignore lint/style/noNonNullAssertion: you clearly see that there is a form there
						const form: HTMLFormElement | null = (
							e.target as HTMLInputElement
						).closest('form')!
						const data = new FormData(form)
						const parsed = formSchema.parse(Object.fromEntries(data))

						updateProfileDebounce({
							nickname: parsed.nickname,
							color: parsed.color,
						})
					}}
				>
					<label className='form-control w-full'>
						<div className='label'>
							<span className='label-text'>Nickname</span>
						</div>
						<input
							className='input input-bordered w-full'
							name='nickname'
							defaultValue={profile.data?.nickname ?? ''}
						/>
					</label>

					<label className='form-control w-full'>
						<div className='label'>
							<span className='label-text'>Color</span>
						</div>
						<input
							className='input input-bordered w-full'
							name='color'
							type='color'
							defaultValue={profile.data?.color ?? ''}
						/>
					</label>
				</form>
			</main>
		</Layout>
	)
}
