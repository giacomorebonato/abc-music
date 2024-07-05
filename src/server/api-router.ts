import { authRouter } from '#/auth/auth-routes'
import { profileRouter } from '#/profile/profile-routes'
import { router } from './trpc-server'

export const apiRouter = router({
	auth: authRouter,
	profile: profileRouter,
})

export type ApiRouter = typeof apiRouter
