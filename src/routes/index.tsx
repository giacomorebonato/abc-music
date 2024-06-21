import Editor from '@monaco-editor/react'
import { createFileRoute } from '@tanstack/react-router'
import { Helmet } from 'react-helmet-async'
import { Layout } from '#/browser/layout'
import 'abcjs/abcjs-audio.css'
import { HocuspocusProvider } from '@hocuspocus/provider'
import * as abc from 'abcjs'
import debounce from 'debounce'
import { createRef, useCallback, useEffect, useRef, useState } from 'react'
import { IndexeddbPersistence } from 'y-indexeddb'
import type { MonacoBinding } from 'y-monaco'
import * as Y from 'yjs'

export const Route = createFileRoute('/')({
	component: IndexComponent,
})

declare global {
	interface Window {
		monacoBinding: MonacoBinding
	}
}

function createDynamicClass(className: string, styles: string) {
	const styleElement = document.createElement('style')
	const rule = `${className} { ${styles} }`
	styleElement.textContent = rule
	document.head.appendChild(styleElement)
}

const DOC_NAME = 'example-document'

function IndexComponent() {
	const sectionRef = createRef<HTMLDivElement>()
	const audioRef = createRef<HTMLDivElement>()
	const synthControlRef = useRef<abc.SynthObjectController>()
	const [isMount, setIsMount] = useState(false)

	useEffect(() => {
		setIsMount(true)

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

	useEffect(() => {
		if (sectionRef.current) {
			// abc.renderAbc(sectionRef.current, '')
		}
	}, [sectionRef.current])

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const updateMusic = useCallback(
		debounce(async (code?: string) => {
			if (!code || !sectionRef.current) {
				return
			}

			const visualObj = abc.renderAbc(sectionRef.current, code, {
				scrollHorizontal: true,
				viewportHorizontal: true,
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

	return (
		<Layout empty>
			<div className='flex flex-col md:flex-row'>
				<Helmet>
					<title>abc-music</title>
				</Helmet>

				<main className='grid grid-flow-row grid-cols-2 w-full h-screen'>
					<section className='h-screen overflow-hidden col-span-1'>
						{isMount && (
							<Editor
								width='100%'
								theme='vs-dark'
								onMount={async (editor) => {
									const name =
										localStorage.name ?? prompt('Write your nickname')

									localStorage.name = name
									const { MonacoBinding } = await import('y-monaco')
									const ydoc = new Y.Doc()
									const persistence = new IndexeddbPersistence(DOC_NAME, ydoc)

									persistence.on('synced', () => {
										console.log('content from the database is loaded')
									})
									const protocol =
										window.location.protocol === 'http:' ? 'ws' : 'wss'
									const origin = window.location.origin.replace(
										window.location.protocol,
										'',
									)
									const provider = new HocuspocusProvider({
										url: `${protocol}:${origin}/collab/${DOC_NAME}`,
										name: DOC_NAME,
										document: ydoc,
										onConnect() {
											const type = ydoc.getText('monaco')
											const model = editor.getModel()

											if (model) {
												window.monacoBinding = new MonacoBinding(
													type,
													model,
													new Set([editor]),
													provider.awareness,
												)
											}
										},
									})

									provider.setAwarenessField('user', {
										name,
										color: '#ffcc00',
									})

									provider.on(
										'awarenessUpdate',
										({ states }: { states: { clientId: string }[] }) => {
											for (const state of states) {
												createDynamicClass(
													`.yRemoteSelectionHead-${state.clientId}`,
													`border: 1px solid red;`,
												)
												createDynamicClass(
													`.yRemoteSelectionHead-${state.clientId}:hover::after`,
													`content: '${name}';
											 cursor: pointer;
											 padding: 4px;
											 background-color: black;`,
												)
											}
										},
									)
								}}
								options={{
									wordWrap: 'on',
									scrollBeyondLastColumn: 0,
									scrollBeyondLastLine: false,
									minimap: {
										enabled: false,
									},
									fontSize: 16,
								}}
								onChange={updateMusic}
								language='markdown'
							/>
						)}
					</section>
					<section className='h-screen p-4 col-span-1'>
						<div ref={sectionRef} />
						<div ref={audioRef} id='audio' />
					</section>
				</main>
			</div>
		</Layout>
	)
}
