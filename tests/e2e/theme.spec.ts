import { expect, test } from '@playwright/test'

const THEME_STORAGE_KEY = 'dough-calculator:theme'

/** Reads the persisted theme preference from local storage. */
async function storedTheme(page: import('@playwright/test').Page): Promise<unknown> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  }, THEME_STORAGE_KEY)
}

/** Captures computed background colors for the main themed surfaces. */
async function renderedColors(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const background = (element: Element | null) =>
      element ? getComputedStyle(element).backgroundColor : ''

    return {
      body: getComputedStyle(document.body).backgroundColor,
      card: background(document.querySelector('.form-card, .tool-card')),
      field: background(document.querySelector('input[type="number"]:not(:disabled)'))
    }
  })
}

test('follows the system dark preference before the user chooses', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')

  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#161311')
  await expect(page.getByRole('group', { name: 'Color theme' }).getByRole('button', { name: 'System' })).toHaveAttribute('aria-pressed', 'true')
})

test('applies the dark theme before the app bundle initializes', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.addInitScript(() => {
    requestAnimationFrame(() => {
      const root = document.documentElement
      ;(window as typeof window & { __firstPaintTheme?: string }).__firstPaintTheme =
        root.classList.contains('dark') ? 'dark' : 'light'
    })
  })
  await page.route('**/_nuxt/**/*.js', route => route.abort())

  await page.goto('/')
  await page.waitForFunction(() =>
    Boolean((window as typeof window & { __firstPaintTheme?: string }).__firstPaintTheme)
  )

  const firstPaintTheme = await page.evaluate(() =>
    (window as typeof window & { __firstPaintTheme?: string }).__firstPaintTheme
  )
  expect(firstPaintTheme).toBe('dark')
  await expect(page.locator('html')).toHaveClass(/dark/)
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
  const darkColors = {
    body: 'rgb(22, 19, 17)',
    card: 'rgb(33, 29, 25)',
    field: 'rgb(41, 36, 32)'
  }
  const lightColors = {
    body: 'rgb(245, 242, 235)',
    card: 'rgb(255, 253, 248)',
    field: 'rgb(255, 254, 250)'
  }

  for (const route of routes) {
    await page.goto(route)
    await expect(page.locator('html')).toHaveClass(/dark/)
    expect(await renderedColors(page)).toEqual(darkColors)

    await page.getByRole('button', { name: 'Light' }).click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
    expect(await renderedColors(page)).toEqual(lightColors)

    await page.getByRole('button', { name: 'Dark' }).click()
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

test('theme control fits at the intermediate header breakpoint with a wide font', async ({ page }) => {
  await page.setViewportSize({ width: 721, height: 800 })
  await page.goto('/')
  await page.addStyleTag({ content: 'body { font-family: "Arial Black", Arial, sans-serif; }' })

  await expect(page.getByRole('group', { name: 'Color theme' })).toBeVisible()

  const layout = await page.evaluate(() => {
    const toggle = document.querySelector('[aria-label="Color theme"]')?.getBoundingClientRect()
    return {
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      toggleRight: toggle ? window.innerWidth - toggle.right : -1
    }
  })
  expect(layout.overflow).toBeLessThanOrEqual(0)
  expect(layout.toggleRight).toBeGreaterThanOrEqual(0)
})
