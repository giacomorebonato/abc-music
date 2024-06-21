import { Link, useRouter } from '@tanstack/react-router'
import clsx from 'clsx'
import type React from 'react'
import { Suspense, lazy, useEffect, useRef } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { P, match } from 'ts-pattern'
import { trpcClient } from './trpc-client'

const contextClass = {
	dark: 'bg-white-600 font-gray-300',
	default: 'bg-primary',
	error: 'bg-red-600',
	info: 'bg-gray-600',
	success: 'bg-blue-600',
	warning: 'bg-orange-400',
} as const

let Devtools: React.FC = () => null

export function Layout({
	children,
	empty,
	sidebar,
}: { children: React.ReactNode; sidebar?: React.ReactNode; empty: boolean }) {
	const dialogRef = useRef<HTMLDialogElement | null>(null)
	// const utils = trpcClient.useUtils()
	// const profile = trpcClient.auth.profile.useQuery()
	// const logout = trpcClient.auth.logout.useMutation({
	// 	onSuccess() {
	// 		utils.auth.profile.reset()
	// 	},
	// })
	const router = useRouter()
	const checboxRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		const unsuscribe = router.history.subscribe(() => {
			if (checboxRef.current) {
				checboxRef.current.checked = false
			}
		})

		return () => {
			unsuscribe()
		}
	}, [router.history])

	useEffect(() => {
		if (import.meta.env.DEV && !import.meta.env.SSR) {
			Devtools = lazy(() => {
				return import('./devtools').then((c) => ({ default: c.Devtools }))
			})
		}
	})
	return (
		<div>
			<div className='navbar bg-base-100'>
				<div className='flex-1'>
					<a className='btn btn-ghost text-xl' href='/'>
						abc-music
					</a>
				</div>
				<div className='flex-none'>
					<ul className='menu menu-horizontal px-1'>
						<li>
							<a
								href='https://github.com/giacomorebonato/abc-music'
								target='_blank'
								rel='noreferrer'
							>
								GitHub
							</a>
						</li>
						<li>
							<a
								href='https://www.fastrat.dev'
								target='_blank'
								rel='noreferrer'
							>
								Made with FastRat
							</a>
						</li>
					</ul>
				</div>
			</div>
			{children}
		</div>
	)
}
