import Crypto from 'node:crypto'
import type { AbcDatabase } from '#/db/db-plugin'
import { type UserSchema, userTable } from '#/db/user-table'

export class UserQueries {
	constructor(private db: AbcDatabase) {}
	upsert(user: Partial<UserSchema>) {
		const dbUser = this.db
			.insert(userTable)
			.values({
				...user,
				id: user.id ?? Crypto.randomUUID(),
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
			.get()

		return dbUser
	}
}
