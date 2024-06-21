import { blob, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import * as Y from 'yjs'

const cooleyTxt = `X: 1
T: Cooley's
M: 4/4
L: 1/8
R: reel
K: Emin
|:D2|EB{c}BA B2 EB|~B2 AB dBAG|FDAD BDAD|FDAD dAFD|
EBBA B2 EB|B2 AB defg|afe^c dBAF|DEFD E2:|
|:gf|eB B2 efge|eB B2 gedB|A2 FA DAFA|A2 FA defg|
eB B2 eBgB|eB B2 defg|afe^c dBAF|DEFD E2:|`

const ydoc = new Y.Doc()
const type = ydoc.getText('monaco')
type.insert(0, cooleyTxt)

export const collabTable = sqliteTable('collab', {
	id: text('id').primaryKey(),
	content: blob('content').default(Y.encodeStateAsUpdateV2(ydoc)),
})

export const insertCollabSchema = createInsertSchema(collabTable)
export const selectCollabSchema = createSelectSchema(collabTable)
