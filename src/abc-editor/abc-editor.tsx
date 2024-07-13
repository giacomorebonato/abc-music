import { HocuspocusProvider } from '@hocuspocus/provider'
import Editor, {} from '@monaco-editor/react'
import { getContrast } from 'color2k'
import type { editor } from 'monaco-editor'
import { useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import { IndexeddbPersistence } from 'y-indexeddb'
import * as Y from 'yjs'
import { trpcClient } from '#/browser/trpc-client'

function createDynamicClass(className: string, styles: string) {
	const styleElement = document.createElement('style')
	const rule = `${className} { ${styles} }`
	styleElement.textContent = rule
	document.head.appendChild(styleElement)
}

function getContrastingColor(hexColor: string) {
	const blackContrast = getContrast(hexColor, '#000000')
	const whiteContrast = getContrast(hexColor, '#FFFFFF')

	return blackContrast > whiteContrast ? '#000000' : '#FFFFFF'
}

type AwarenessState = {
	clientId: string
	user: {
		nickname: string
		color: string
		contrastingColor: string
	}
}

export function AbcEditor(props: {
	docId?: string
	onMount: (editor: editor.IStandaloneCodeEditor) => void
	onChange: (code?: string) => void
}) {
	const providerRef = useRef<HocuspocusProvider>()
	const profile = trpcClient.profile.ownProfile.useQuery()
	const docId = props.docId ?? 'example-document'

	useEffect(() => {
		return () => {
			providerRef.current?.disconnect()
		}
	}, [])

	useEffect(() => {
		if (profile.data?.color && providerRef.current) {
			providerRef.current.setAwarenessField('user', {
				nickname: profile.data.nickname,
				contrastingColor: getContrastingColor(profile.data.color),
				color: profile.data.color,
			})
		}
	}, [profile.data])

	return (
		<Editor
			width='100%'
			theme='vs-dark'
			onMount={async (editor) => {
				props.onMount(editor)

				const { MonacoBinding } = await import('y-monaco')
				const ydoc = new Y.Doc()
				const persistence = new IndexeddbPersistence(docId, ydoc)

				persistence.on('synced', () => {
					toast('Content from Indexeddb is loaded', {
						autoClose: 500,
						position: 'bottom-right',
					})
				})
				const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss'
				const origin = window.location.origin.replace(
					window.location.protocol,
					'',
				)

				providerRef.current = new HocuspocusProvider({
					url: `${protocol}:${origin}/collab/${docId}`,
					name: docId,
					document: ydoc,
					onConnect() {
						console.log('Hocuspocus connected')
					},
				})

				const type = ydoc.getText('monaco')
				const model = editor.getModel()

				if (model) {
					window.monacoBinding = new MonacoBinding(
						type,
						model,
						new Set([editor]),
						providerRef.current.awareness,
					)
				}

				providerRef.current.on(
					'awarenessUpdate',
					({
						states,
					}: {
						states: AwarenessState[]
					}) => {
						for (const state of states) {
							if (!state.user?.color) {
								continue
							}

							createDynamicClass(
								`.yRemoteSelectionHead-${state.clientId}`,
								`border: 1px solid ${state.user.color};`,
							)
							createDynamicClass(
								`.yRemoteSelectionHead-${state.clientId}:hover::after`,
								`content: '${state.user.nickname}';
								cursor: pointer;
								padding: 4px;
								color: ${state.user.contrastingColor}
								background-color: ${state.user.color};`,
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
			onChange={props.onChange}
			language='markdown'
		/>
	)
}

export default AbcEditor
