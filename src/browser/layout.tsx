import { Link, useRouter } from '@tanstack/react-router'
import type React from 'react'
import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import {
	AdjustmentsHorizontalIcon,
	MusicalNoteIcon,
	PencilIcon,
} from '@heroicons/react/24/solid'

let Devtools: React.FC = () => null

export function Layout({
	children,
	tab,
	empty,
	sidebar,
}: {
	children: React.ReactNode
	sidebar?: React.ReactNode
	empty: boolean
	tab: 'edit' | 'partiture' | 'settings'
}) {
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
			<div className='navbar bg-primary text-primary-content'>
				<div className='flex-1'>
					<a className='btn btn-ghost text-xl' href='/'>
						abc-music
					</a>
				</div>
				<div className='hidden md:block flex-none'>
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
								href='https://paulrosen.github.io/abcjs/'
								target='_blank'
								rel='noreferrer'
							>
								abcjs
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
			<div className='btm-nav md:hidden'>
				<Link
					to='/'
					search={{
						tab: 'edit',
					}}
				>
					<PencilIcon className='size-6' />
				</Link>

				<Link
					to='/'
					search={{
						tab: 'partiture',
					}}
				>
					<MusicalNoteIcon className='size-6' />
				</Link>

				<Link
					to='/'
					search={{
						tab: 'settings',
					}}
				>
					<AdjustmentsHorizontalIcon className='size-6' />
				</Link>
			</div>
		</div>
	)
}
