import { z } from 'zod'
import { publicProcedure, router } from '#/server/trpc-server'

export const partitureApi = router({
	search: publicProcedure
		.input(z.object({ text: z.string() }))
		.query(({ ctx, input }) => {
			const partituresQuery = ctx.db.query.partitures
				.findMany({
					where: (partiture, params) => {
						return params.like(partiture.title, `%${input.text}%`)
					},
				})
				.sync()

			return partituresQuery.map((partiture) => {
				return {
					value: partiture.collabId,
					label: partiture.title,
				}
			})
		}),
})
