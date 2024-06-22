import { proxy, useSnapshot } from 'valtio'

const ui = proxy({
	currentTab: 'edit' as 'edit' | 'partiture' | 'settings',
	actions: {
		set(data: Partial<Omit<typeof ui, 'actions'>>) {
			Object.assign(ui, data)
		},
	},
})

export const clientState = proxy({
	ui,
})

export function useClientSnap() {
	return useSnapshot(clientState)
}
