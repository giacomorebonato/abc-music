import EventEmitter from 'node:events'
import type TypedEmitter from 'typed-emitter'
import { upsertPartiture } from '#/abc-editor/partiture-queries'

import type { Collab } from './collab-table'

export const dbEvents = new EventEmitter() as TypedEmitter<{
	upsertCollab: (entry: Collab) => void
}>

dbEvents.on('upsertCollab', upsertPartiture)
