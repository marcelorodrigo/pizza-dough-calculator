import { expect, test } from '@playwright/test'

const THEME_STORAGE_KEY = 'dough-calculator:theme'

async function storedTheme(page: import('@playwright/test').Page): Promise<unknown> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  }, THEME_STORAGE_KEY)
}

test('follows the system dark preference before the user chooses', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')

  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#161311')
  await expect(page.getByRole('group', { name: 'Color theme' }).getByRole('button', { name: 'System' })).toHaveAttribute('aria-pressed', 'true')
})

test('follows the system light preference before the user chooses', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')

  await expect(page.locator('html')).not.toHaveClass(/dark/)
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f5f2eb')
})

test('manual light overrides a dark system preference and survives reload', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')

  await page.getByRole('button', { name: 'Light' }).click()

  await expect(page.locator('html')).not.toHaveClass(/dark/)
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f5f2eb')
  expect(await storedTheme(page)).toEqual({ version: 1, data: 'light' })

  await page.reload()

  await expect(page.locator('html')).not.toHaveClass(/dark/)
})

test('manual dark overrides a light system preference and survives reload', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')

  await page.getByRole('button', { name: 'Dark' }).click()

  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#161311')
  expect(await storedTheme(page)).toEqual({ version: 1, data: 'dark' })

  await page.reload()

  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('system mode follows live color-scheme changes', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')

  await page.getByRole('button', { name: 'System' }).click()
  await expect(page.locator('html')).not.toHaveClass(/dark/)

  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#161311')

  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('html')).not.toHaveClass(/dark/)
})

test('dark theme stays applied across every calculator route', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Dark' }).click()

  const routes = ['/', '/tools/flour-strength', '/tools/tin-mass', '/tools/water-temperature']

  for (const route of routes) {
    await page.goto(route)
    await expect(page.locator('html')).toHaveClass(/dark/)
  }
})

test('theme control fits on a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/')

  await expect(page.getByRole('group', { name: 'Color theme' })).toBeVisible()

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})
