import { HocuspocusProvider } from '@hocuspocus/provider'
import Editor, {} from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useEffect, useState } from 'react'
import { IndexeddbPersistence } from 'y-indexeddb'
import * as Y from 'yjs'

function createDynamicClass(className: string, styles: string) {
	const styleElement = document.createElement('style')
	const rule = `${className} { ${styles} }`
	styleElement.textContent = rule
	document.head.appendChild(styleElement)
}

const DOC_NAME = 'example-document'

export function AbcEditor(props: {
	onMount: (editor: editor.IStandaloneCodeEditor) => void
	onChange: (code?: string) => void
}) {
	const [isMount, setIsMount] = useState(false)

	useEffect(() => {
		setIsMount(true)
	}, [])

	if (!isMount) {
		return null
	}

	return (
		<Editor
			width='100%'
			theme='vs-dark'
			onMount={async (editor) => {
				props.onMount(editor)
				const name = localStorage.name ?? prompt('Write your nickname')

				localStorage.name = name
				const { MonacoBinding } = await import('y-monaco')
				const ydoc = new Y.Doc()
				const persistence = new IndexeddbPersistence(DOC_NAME, ydoc)

				persistence.on('synced', () => {
					console.log('content from the database is loaded')
				})
				const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss'
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
					({
						states,
					}: { states: { clientId: string; user: { name: string } }[] }) => {
						for (const state of states) {
							createDynamicClass(
								`.yRemoteSelectionHead-${state.clientId}`,
								`border: 1px solid red;`,
							)
							createDynamicClass(
								`.yRemoteSelectionHead-${state.clientId}:hover::after`,
								`content: '${state.user.name}';
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
			onChange={props.onChange}
			language='markdown'
		/>
	)
}
