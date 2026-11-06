import { afterEach, describe, expect, it, vi } from 'vitest'
import { createThemeInitScript } from '../../app/utils/theme-init-script'

/** Executes the generated inline theme script in the test document. */
function runInitScript() {
  new Function(createThemeInitScript())()
}

/** Stubs matchMedia to report the supplied system preference. */
function stubSystemTheme(prefersDark: boolean) {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: prefersDark })))
}

/** Writes a versioned theme preference to local storage. */
function storedTheme(preference: string) {
  localStorage.setItem(
    'dough-calculator:theme',
    JSON.stringify({ version: 1, data: preference })
  )
}

/** Returns the current theme-color metadata value. */
function themeColor() {
  return document.querySelector('meta[name="theme-color"]')?.getAttribute('content')
}

describe('theme init script', () => {
  afterEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => meta.remove())
    vi.unstubAllGlobals()
  })

  it('applies a saved dark preference before the app renders', () => {
    stubSystemTheme(false)
    storedTheme('dark')

    runInitScript()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(themeColor()).toBe('#161311')
  })

  it('keeps an explicit light preference even when the system prefers dark', () => {
    stubSystemTheme(true)
    storedTheme('light')

    runInitScript()

    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(themeColor()).toBe('#f5f2eb')
  })

  it('follows the system preference when no preference is saved', () => {
    stubSystemTheme(true)

    runInitScript()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(themeColor()).toBe('#161311')
  })

  it('falls back to the system preference when the saved value is invalid', () => {
    stubSystemTheme(true)
    storedTheme('sepia')

    runInitScript()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('survives corrupt stored data and still resolves the system preference', () => {
    stubSystemTheme(true)
    localStorage.setItem('dough-calculator:theme', '{')

    expect(() => runInitScript()).not.toThrow()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('creates the theme-color meta tag when none exists', () => {
    stubSystemTheme(true)

    runInitScript()

    const metas = document.querySelectorAll('meta[name="theme-color"]')
    expect(metas).toHaveLength(1)
    expect(metas[0]?.getAttribute('content')).toBe('#161311')
  })

  it('keeps a single theme-color meta tag when duplicates exist', () => {
    stubSystemTheme(true)
    for (let index = 0; index < 2; index += 1) {
      const meta = document.createElement('meta')
      meta.setAttribute('name', 'theme-color')
      meta.setAttribute('content', '#f5f2eb')
      document.head.appendChild(meta)
    }

    runInitScript()

    const metas = document.querySelectorAll('meta[name="theme-color"]')
    expect(metas).toHaveLength(1)
    expect(metas[0]?.getAttribute('content')).toBe('#161311')
  })
})
