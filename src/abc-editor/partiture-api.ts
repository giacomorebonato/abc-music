import { TRPCError } from '@trpc/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { publicProcedure, router } from '#/server/trpc-server'

export const partitureApi = router({
	list: publicProcedure
		.input(
			z.object({
				page: z.number(),
				text: z.string().optional(),
			}),
		)
		.query(({ ctx, input }) => {
			const partitures = ctx.db.query.partitures
				.findMany({
					where: (partiture, o) => {
						if (input.text) {
							return o.like(partiture.title, `%${input.text}%`)
						}
					},
				})
				.sync()

			return partitures
		}),
	delete: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(({ ctx, input }) => {
			const partiture = ctx.db.query.partitures
				.findFirst({
					where(p, { eq }) {
						return eq(p.id, input.id)
					},
				})
				.sync()

			if (!partiture) {
				throw new TRPCError({ code: 'NOT_FOUND' })
			}

			ctx.db.delete(ctx.t.partitures).where(eq(ctx.t.partitures.id, input.id))
			ctx.db
				.delete(ctx.t.collabs)
				.where(eq(ctx.t.collabs.id, partiture?.collabId))
		}),
	search: publicProcedure
		.input(z.object({ text: z.string() }))
		.query(({ ctx, input }) => {
			const partitures = ctx.db.query.partitures
				.findMany({
					where: (partiture, params) => {
						return params.like(partiture.title, `%${input.text}%`)
					},
				})
				.sync()

			return partitures.map((partiture) => {
				return {
					value: partiture.collabId,
					label: partiture.title,
				}
			})
		}),
})
