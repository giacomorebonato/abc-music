import { PartitureQueries } from '#/abc-editor/partiture-queries'
import { UserQueries } from '#/auth/user-queries'
import { CollabQueries } from '#/collaboration/collab-queries'
import type { AbcDatabase, DbEvents } from './db-plugin'

export function buildQueries(db: AbcDatabase, dbEvents: DbEvents) {
	return {
		user: new UserQueries(db),
		collab: new CollabQueries(db, dbEvents),
		partiture: new PartitureQueries(db),
	}
}

export type Queries = ReturnType<typeof buildQueries>
