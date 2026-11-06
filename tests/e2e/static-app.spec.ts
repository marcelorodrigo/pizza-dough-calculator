import { expect, test } from '@nuxt/test-utils/playwright'

test('static output serves every calculator route', async ({ page, goto }) => {
  const routes = [
    { path: '/', heading: 'A better dough' },
    { path: '/tools/flour-strength', heading: 'Flour strength' },
    { path: '/tools/tin-mass', heading: 'Tin dough mass' },
    { path: '/tools/water-temperature', heading: 'Water temperature' }
  ]

  for (const route of routes) {
    await goto(route.path, { waitUntil: 'hydration' })
    await expect(page.getByRole('heading', { name: new RegExp(route.heading, 'i'), level: 1 })).toBeVisible()
  }
})

test('generated output includes the PWA manifest and precaching service worker', async ({ page }) => {
  const manifestResponse = await page.request.get('/manifest.webmanifest')
  expect(manifestResponse.ok()).toBe(true)
  const manifest = await manifestResponse.json()
  expect(manifest.name).toBe('Dough Notes')
  expect(manifest.icons).toEqual(expect.arrayContaining([
    expect.objectContaining({ src: '/pwa-192.png', sizes: '192x192' }),
    expect.objectContaining({ src: '/pwa-512.png', sizes: '512x512' }),
    expect.objectContaining({ src: '/pwa-maskable-512.png', purpose: 'maskable' })
  ]))

  const workerResponse = await page.request.get('/sw.js')
  expect(workerResponse.ok()).toBe(true)
  const worker = await workerResponse.text()
  expect(worker).toContain('precacheAndRoute')
  expect(worker).toContain('tools/tin-mass')
})

test('restores the last recipe inputs after reloading', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })
  const roomHours = page.getByLabel('Room fermentation time')
  await roomHours.fill('12')
  await expect(roomHours).toHaveValue('12')

  await page.reload()

  await expect(page.getByLabel('Room fermentation time')).toHaveValue('12')
})

test('serves the calculator shell and calculates after going offline', async ({ page, context, goto }) => {
  await goto('/', { waitUntil: 'hydration' })
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.reload()
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null)

  await context.setOffline(true)
  await page.goto('/tools/tin-mass')

  await expect(page.getByRole('heading', { name: 'Tin dough mass' })).toBeVisible()
  await page.getByLabel('Side 1').fill('30')
  await page.getByLabel('Side 2').fill('40')
  await expect(page.getByLabel('Rectangular tin dough mass')).toHaveText('600 g')
})
