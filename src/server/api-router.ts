import { authApi } from '#/auth/auth-api'
import { profileApi } from '#/profile/profile-api'
import { router } from './trpc-server'

export const apiRouter = router({
	auth: authApi,
	profile: profileApi,
})

export type ApiRouter = typeof apiRouter
