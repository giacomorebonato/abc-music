import { authRouter } from '#/auth/auth-routes'
import { router } from './trpc-server'

export const apiRouter = router({
	auth: authRouter,
})

export type ApiRouter = typeof apiRouter
