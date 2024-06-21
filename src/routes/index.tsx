import Editor from '@monaco-editor/react'
import { createFileRoute } from '@tanstack/react-router'
import { Helmet } from 'react-helmet-async'
import { Layout } from '#/browser/layout'
import 'abcjs/abcjs-audio.css'
import { HocuspocusProvider } from '@hocuspocus/provider'
import * as abc from 'abcjs'
import { createRef, useEffect, useState } from 'react'
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
	const sectionRef = createRef<HTMLElement>()
	const [isMount, setIsMount] = useState(false)

	useEffect(() => {
		setIsMount(true)
	}, [])

	return (
		<Layout empty>
			<div className='flex flex-col md:flex-row'>
				<Helmet>
					<title>abc-music</title>
				</Helmet>

				<main className='flex flex-row w-full h-screen'>
					<section className='flex-1 h-screen overflow-hidden'>
						{isMount && (
							<Editor
								height='100vh'
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
									const provider = new HocuspocusProvider({
										url: import.meta.env.PROD
											? `wss://abc-music.fly.dev/collab/${DOC_NAME}`
											: `ws://localhost:3000/collab/${DOC_NAME}`,
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
									minimap: {
										enabled: false,
									},
								}}
								onChange={(code) => {
									if (code && sectionRef.current) {
										abc.renderAbc(sectionRef.current, code)
									}
								}}
							/>
						)}
					</section>
					<section className='flex-2 h-screen p-4' ref={sectionRef} />
				</main>
			</div>
		</Layout>
	)
}
