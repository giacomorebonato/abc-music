import { createFileRoute } from '@tanstack/react-router'
import { Helmet } from 'react-helmet-async'
import { Layout } from '#/browser/layout'
import 'abcjs/abcjs-audio.css'
import { useMediaQuery } from '@uidotdev/usehooks'
import * as abc from 'abcjs'
import { clsx } from 'clsx'
import debounce from 'debounce'
import type { editor } from 'monaco-editor'
import { createRef, useCallback, useEffect, useRef } from 'react'
import type { MonacoBinding } from 'y-monaco'
import { z } from 'zod'
import { AbcEditor } from '#/abc-editor/abc-editor'

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
		monacoBinding: MonacoBinding
	}
}

function IndexComponent() {
	const editorRef = useRef<editor.IStandaloneCodeEditor>(null)
	const sectionRef = createRef<HTMLDivElement>()
	const audioRef = createRef<HTMLDivElement>()
	const synthControlRef = useRef<abc.SynthObjectController>()
	const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')
	const { tab } = Route.useSearch()

	useEffect(() => {
		if (abc.synth.supportsAudio()) {
			const synthControl = new abc.synth.SynthController()
			const cursorControl = {}
			synthControl.load('#audio', cursorControl, {
				displayLoop: true,
				displayRestart: true,
				displayPlay: true,
				displayProgress: true,
				displayWarp: true,
			})
			synthControlRef.current = synthControl
		}
	}, [])

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const updateMusic = useCallback(
		debounce(async (code?: string) => {
			if (!code || !sectionRef.current) {
				return
			}

			const visualObj = abc.renderAbc(sectionRef.current, code, {
				expandToWidest: true,
				responsive: 'resize',
			})

			const createSynth = new abc.synth.CreateSynth()
			await createSynth.init({ visualObj: visualObj[0] })
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			synthControlRef.current!.setTune(visualObj[0], false, {
				chordsOff: true,
			})
		}),
		[synthControlRef.current, sectionRef.current],
	)

	useEffect(() => {
		if (isSmallDevice && editorRef.current) {
			updateMusic(editorRef.current.getValue())
		}
	}, [isSmallDevice, updateMusic])

	return (
		<Layout empty tab={tab}>
			<div className='flex flex-col md:flex-row'>
				<Helmet>
					<title>abc-music</title>
				</Helmet>

				<main
					className={clsx('w-full h-screen', {
						'grid grid-flow-row grid-cols-2': !isSmallDevice,
					})}
				>
					<section
						className={clsx('h-screen overflow-hidden col-span-1', {
							active: tab === 'edit',
							hidden: isSmallDevice && tab !== 'edit',
						})}
					>
						<AbcEditor
							onChange={updateMusic}
							onMount={(editor) => {
								editorRef.current = editor
							}}
						/>
					</section>

					<section
						className={clsx('h-screen p-4 col-span-1', {
							'active w-full': tab === 'partiture',
							hidden: isSmallDevice && tab !== 'partiture',
						})}
					>
						<div ref={sectionRef} />
						<div ref={audioRef} id='audio' />
					</section>
				</main>
			</div>
		</Layout>
	)
}
