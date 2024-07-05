import { Link, useRouter } from '@tanstack/react-router'
import type React from 'react'
import { useEffect, useRef } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import {
	AdjustmentsHorizontalIcon,
	CogIcon,
	MusicalNoteIcon,
	PencilIcon,
} from '@heroicons/react/24/solid'
import { ToastContainer } from 'react-toastify'
import { ClientOnly } from '#/server/client-only'
import { trpcClient } from './trpc-client'

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
	const utils = trpcClient.useUtils()
	const profile = trpcClient.profile.ownProfile.useQuery()
	const logout = trpcClient.auth.logout.useMutation({
		onSuccess() {
			utils.profile.ownProfile.reset()
		},
	})
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

	return (
		<div>
			<div className='navbar bg-primary text-primary-content'>
				<div className='flex-1'>
					<Link
						className='btn btn-ghost text-xl'
						to='/'
						search={{
							tab: 'edit',
						}}
					>
						abc-music
					</Link>
				</div>
				<div className='flex-none gap-2'>
					<div className='form-control'>
						<input
							type='text'
							placeholder='Search'
							className='input input-bordered w-24 md:w-auto'
						/>
					</div>
					<div className='dropdown dropdown-end'>
						<div
							tabIndex={0}
							role='button'
							className='btn btn-ghost btn-circle avatar'
						>
							<div className='w-10 rounded-full'>
								<CogIcon />
							</div>
						</div>
						<ul
							// biome-ignore lint/a11y/noNoninteractiveTabindex: I think this breaks the menu if removed
							tabIndex={0}
							className='menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow text-primary'
						>
							{profile.data ? (
								<li>
									<Link to='/profile'>Profile</Link>
								</li>
							) : null}

							{profile.data ? (
								<li>
									<button
										type='button'
										onClick={() => {
											logout.mutate()
										}}
									>
										Logout
									</button>
								</li>
							) : (
								<li>
									<button
										type='button'
										onClick={() => {
											dialogRef.current?.showModal()
										}}
									>
										Login
									</button>
								</li>
							)}
							<li>
								<a
									href='https://github.com/giacomorebonato/abc-music'
									target='_blank'
									rel='noreferrer'
								>
									GitHub
								</a>
							</li>
						</ul>
					</div>
				</div>
				{/* <div className='form-control'>
					<input
						type='text'
						placeholder='Search'
						className='input input-bordered w-24 md:w-auto text-primary'
					/>
				</div>
				<div className='hidden md:block flex-none'>
					<ul className='menu menu-horizontal px-1'>

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
						<li>
							<details>
								<summary>Parent</summary>
								<ul className='z-10 bg-primary-content rounded-t-none p-2 text-primary'>
									<li>
										<a>Create new</a>
									</li>
									<li>
										<a>Search</a>
									</li>
								</ul>
							</details>
						</li>
					</ul>
				</div> */}
			</div>
			{children}
			<div className='btm-nav md:hidden'>
				<Link
					to='/'
					aria-label='edit'
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
					aria-label='partiture'
				>
					<MusicalNoteIcon className='size-6' />
				</Link>

				<Link
					aria-label='settings'
					to='/'
					search={{
						tab: 'settings',
					}}
				>
					<AdjustmentsHorizontalIcon className='size-6' />
				</Link>
			</div>

			<dialog className='modal' id='my_modal_2' ref={dialogRef}>
				<div className='modal-box grid grid-cols-1'>
					<a href='/login/google'>Login with Google</a>
				</div>
				<form method='dialog' className='modal-backdrop'>
					{/* biome-ignore lint/a11y/useButtonType: otherwise "close on click outside" doesn't work */}
					<button>close</button>
				</form>
			</dialog>

			<ToastContainer />
			<ClientOnly load={() => import('./devtools')}>
				{(MyComponent) => <MyComponent />}
			</ClientOnly>
		</div>
	)
}
