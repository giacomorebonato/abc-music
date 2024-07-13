import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import type React from 'react'
import { useEffect, useRef } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { Bars3Icon } from '@heroicons/react/24/solid'
import Select from 'react-select'
import { ToastContainer } from 'react-toastify'
import { useDebounceValue } from 'usehooks-ts'
import { ClientOnly } from '#/server/client-only'
import { trpcClient } from './trpc-client'

export function Layout({
	children,
}: {
	children: React.ReactNode
}) {
	const navigate = useNavigate()
	const dialogRef = useRef<HTMLDialogElement | null>(null)
	const utils = trpcClient.useUtils()
	const profile = trpcClient.profile.ownProfile.useQuery()
	const [text, setText] = useDebounceValue('', 1_000)
	const search = trpcClient.partiture.search.useQuery({ text })

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
		<div className='drawer drawer-end'>
			<input
				id='my-drawer'
				type='checkbox'
				className='drawer-toggle'
				ref={checboxRef}
			/>

			<div className='drawer-content'>
				<div className='navbar bg-primary text-primary-content'>
					<div className='flex-1'>
						<Link className='btn btn-ghost text-xl' to='/'>
							abc-music
						</Link>
					</div>
					<div className='flex-none gap-2'>
						<div className='form-control'>
							<Select
								options={search.data ?? []}
								isSearchable
								className='w-52'
								// className='input input-bordered w-24 md:w-auto'
								placeholder='Search'
								onInputChange={(newValue) => {
									setText(newValue)
								}}
								onChange={(newValue) => {
									if (newValue) {
										navigate({
											to: '/',
											search: {
												docId: newValue.value,
											},
										})
									}
								}}
							/>
						</div>
						<div className='dropdown dropdown-end'>
							<div
								tabIndex={0}
								role='button'
								className='btn btn-ghost btn-circle avatar'
							>
								<label
									htmlFor='my-drawer'
									className='drawer-button cursor-pointer'
								>
									<div className='w-10 rounded-full'>
										<Bars3Icon />
									</div>
								</label>
							</div>
						</div>
					</div>
				</div>
				{children}
			</div>

			<div className='drawer-side'>
				<label
					htmlFor='my-drawer'
					aria-label='close sidebar'
					className='drawer-overlay'
				/>
				<ul className='menu bg-base-200 text-base-content min-h-full w-80 p-4'>
					{/* Sidebar content here */}
					<li>
						<button
							type='button'
							onClick={() => {
								navigate({ to: '/', search: { docId: crypto.randomUUID() } })
							}}
						>
							Create new
						</button>
					</li>

					<li>
						{profile.data ? (
							<button
								type='button'
								onClick={() => {
									logout.mutate()
								}}
							>
								Logout
							</button>
						) : (
							<button
								type='button'
								onClick={() => {
									dialogRef.current?.showModal()
								}}
							>
								Login
							</button>
						)}
					</li>
				</ul>
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
			{import.meta.env.DEV && (
				<ClientOnly load={() => import('./devtools')}>
					{(MyComponent) => <MyComponent />}
				</ClientOnly>
			)}
		</div>
	)
}
