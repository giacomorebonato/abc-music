import Crypto from 'node:crypto'
import type { AbcDatabase } from '#/db/db-plugin'
import { userTable } from '#/db/user-table'

export function upsertUser(db: AbcDatabase, user: { email: string }) {
	const dbUsers = db
		.insert(userTable)
		.values({
			email: user.email.trim(),
			id: Crypto.randomUUID(),
		})
		.onConflictDoUpdate({
			set: {
				updatedAt: new Date(),
			},
			target: userTable.email,
		})
		.returning({
			email: userTable.email,
			nickname: userTable.nickname,
			id: userTable.id,
		})
		.all()

	const dbUser = dbUsers[0]

	if (dbUser) {
		return dbUser
	}

	throw Error(`user not created`)
}
