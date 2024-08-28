import { expect, test } from '@playwright/test'
import { HtmlValidate } from 'html-validate/node'

test(`it renders valid HTML`, async ({ browser }) => {
	const context = await browser.newContext({
		javaScriptEnabled: false,
	})
	const page = await context.newPage()
	await page.goto('http://localhost:3000')

	const htmlvalidate = new HtmlValidate({
		extends: ['html-validate:recommended'],
		rules: {
			'no-trailing-whitespace': 0,
			'attribute-empty-style': 0,
			'valid-id': 0,
			'wcag/h32': 0,
			'prefer-native-element': 0,
			'no-implicit-button-type': 0,
		},
	})
	const html = await page.content()
	const report = await htmlvalidate.validateString(html)

	expect(report.valid).toBe(true)
})

test(`it renders valid HTML of the main page with clientOnly rendering`, async ({
	page,
}) => {
	page.on('console', (msg) => {
		if (msg.type() === 'error') {
			throw Error(msg.text())
		}
	})

	await page.goto('http://localhost:3000?clientOnly=true')
	await page.getByTestId(`btn-logout`).click()
})
