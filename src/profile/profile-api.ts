import { z } from 'zod'
import { publicProcedure, router } from '#/server/trpc-server'

export const profileApi = router({
	ownProfile: publicProcedure.query(({ ctx }) => {
		if (!ctx.user) {
			return null
		}

		const profile = ctx.db.query.profiles
			.findFirst({
				where: (profile, { eq }) => {
					// biome-ignore lint/style/noNonNullAssertion: <explanation>
					return eq(profile.userId, ctx.user!.userId)
				},
			})
			.sync()

		if (profile) {
			return profile
		}

		return ctx.db
			.insert(ctx.t.profiles)
			.values({
				color: '#fff',
				nickname: 'nickname',
				userId: ctx.user.userId,
			})
			.onConflictDoNothing()
			.returning()
			.get()
	}),
	updateProfile: publicProcedure
		.input(
			z.object({
				color: z.string(),
				nickname: z.string(),
			}),
		)
		.mutation(({ ctx, input }) => {
			const data = ctx.db
				.update(ctx.t.profiles)
				.set({ nickname: input.nickname, color: input.color })
				.run()

			return data
		}),
})
