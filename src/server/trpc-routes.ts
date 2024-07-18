import { partitureApi } from '#/abc-editor/partiture-api'
import { authApi } from '#/auth/auth-api'
import { profileApi } from '#/profile/profile-api'
import { createCallerFactory, router } from './trpc-server'

export const apiRouter = router({
	auth: authApi,
	profile: profileApi,
	partiture: partitureApi,
})

export type ApiRouter = typeof apiRouter
export const createCaller = createCallerFactory(apiRouter)
