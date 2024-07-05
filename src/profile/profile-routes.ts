import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { publicProcedure, router } from '#/server/trpc-server'

export const profileRouter = router({
	ownProfile: publicProcedure.query(({ ctx }) => {
		if (!ctx.user) {
			return null
		}

		const profiles = ctx.db
			.select()
			.from(ctx.schema.profileTable)
			.where(eq(ctx.schema.profileTable.userId, ctx.user.userId))
			.all()

		if (profiles.length) {
			return profiles[0]
		}

		const profile = ctx.db
			.insert(ctx.schema.profileTable)
			.values({
				color: '#fff',
				nickname: 'nickname',
				userId: ctx.user.userId,
			})
			.onConflictDoNothing()
			.returning()
			.get()

		return profile
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
				.update(ctx.schema.profileTable)
				.set({ nickname: input.nickname, color: input.color })
				.run()

			return data
		}),
})
