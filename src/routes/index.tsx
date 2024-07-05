import { createFileRoute } from '@tanstack/react-router'
import * as abc from 'abcjs'
import { clsx } from 'clsx'
import debounce from 'debounce'
import type { editor } from 'monaco-editor'
import { createRef, useCallback, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useMediaQuery } from 'usehooks-ts'
import type { MonacoBinding } from 'y-monaco'
import { z } from 'zod'
import { Layout } from '#/browser/layout'
import { ClientOnly } from '#/server/client-only'

const searchSchema = z.object({
	tab: z.enum(['edit', 'partiture', 'settings']).catch('edit').default('edit'),
})

export const Route = createFileRoute('/')({
	component: IndexComponent,
	validateSearch(search: Record<string, unknown>) {
		return searchSchema.parse(search)
	},
})

declare global {
	interface Window {
		createSynth: abc.MidiBuffer
		monacoBinding: MonacoBinding
		tuneObject: abc.TuneObject
		synthControl: abc.SynthObjectController
	}
}

function IndexComponent() {
	const sectionRef = createRef<HTMLDivElement>()
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
	const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)', {
		defaultValue: false,
	})
	const { tab } = Route.useSearch()
	const synthControlRef = useRef<abc.SynthObjectController>()

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const updateMusic = useCallback(
		debounce(async () => {
			if (!editorRef.current || !sectionRef.current) {
				return
			}
			const code = editorRef.current.getValue()

			const tuneObject = abc.renderAbc(sectionRef.current, code, {
				expandToWidest: true,
				responsive: 'resize',
				clickListener(...params) {
					console.log(params)
				},
			})[0]

			if (tuneObject && window.createSynth) {
				window.tuneObject = tuneObject
				window.createSynth
					.init({ visualObj: tuneObject })
					.then(() => {
						console.log(`Synth initialised`)
						return window.synthControl.setTune(tuneObject, false, {
							chordsOff: true,
						})
					})
					.catch((error) => {
						console.log(error)
					})
			}
		}),
		[synthControlRef.current, sectionRef.current],
	)

	useEffect(() => {
		if (isSmallDevice && editorRef.current && tab === 'partiture') {
			updateMusic()
		}
	}, [isSmallDevice, updateMusic, tab])

	return (
		<Layout empty tab={tab}>
			<div className='flex flex-col md:flex-row'>
				<Helmet>
					<title>abc-music</title>
					<meta
						name='description'
						content='Collaborative text editor for ABC music notation.'
					/>
					<link rel='canonical' href='https://abc-music.fly.dev/' />
				</Helmet>

				<main
					className={'w-full h-screen md:grid md:grid-flow-row md:grid-cols-2'}
				>
					<section
						className={clsx('h-screen overflow-hidden col-span-1', {
							active: tab === 'edit',
							hidden: isSmallDevice && tab !== 'edit',
						})}
					>
						<ClientOnly
							load={() => import('#/abc-editor/abc-editor')}
							fallback='...loading'
						>
							{(MyComponent) => (
								<MyComponent
									onChange={updateMusic}
									onMount={(editor) => {
										editorRef.current = editor
									}}
								/>
							)}
						</ClientOnly>
					</section>

					<section
						className={clsx('h-screen p-4 col-span-1', {
							'active w-full': tab === 'partiture',
							hidden: isSmallDevice && tab !== 'partiture',
						})}
					>
						<ClientOnly
							load={() => import('#/abc-editor/partiture')}
							fallback='Loading...'
						>
							{(MyComponent) => (
								<MyComponent
									sectionRef={sectionRef}
									synthControlRef={synthControlRef}
									updateMusic={updateMusic}
								/>
							)}
						</ClientOnly>
					</section>
				</main>
			</div>
		</Layout>
	)
}
