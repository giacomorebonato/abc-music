import Path from 'node:path'
import Root from 'app-root-path'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	dbCredentials: {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		url: process.env.DATABASE_URL!,
	},
	schema: Path.join(Root.path, 'src', 'db', 'schema.ts'),
	out: './migrations',
	dialect: 'sqlite',
})
