import Crypto from 'node:crypto'
import type { AbcDatabase } from '#/db/db-plugin'
import { type UserSchema, userTable } from '#/db/user-table'

export class UserQueries {
	db: AbcDatabase
	constructor(_db: AbcDatabase) {
		this.db = _db
	}
	upsert(user: Partial<UserSchema>) {
		const dbUser = this.db
			.insert(userTable)
			.values({
				// email: user.email.trim(),
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
