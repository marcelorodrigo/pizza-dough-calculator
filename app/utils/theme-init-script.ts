import { THEME_COLORS, THEME_STORAGE_KEY } from '../domain/theme'
import { STATE_STORAGE_PREFIX, STATE_VERSION } from '../services/calculator-state-store'

// This runs before hydration, so it intentionally duplicates the small
// validation and resolution rules from app/domain/theme.ts.
export function createThemeInitScript(): string {
  const storageKey = JSON.stringify(`${STATE_STORAGE_PREFIX}${THEME_STORAGE_KEY}`)
  const lightColor = JSON.stringify(THEME_COLORS.light)
  const darkColor = JSON.stringify(THEME_COLORS.dark)
  const version = JSON.stringify(STATE_VERSION)

  return `(() => {
  const root = document.documentElement
  let preference = 'system'
  try {
    const raw = localStorage.getItem(${storageKey})
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.version === ${version} && ['system', 'light', 'dark'].includes(parsed.data)) {
        preference = parsed.data
      }
    }
  } catch {}
  let systemPrefersDark = false
  try {
    systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {}
  const dark = preference === 'dark' || (preference === 'system' && systemPrefersDark)
  root.classList.toggle('dark', dark)
  const color = dark ? ${darkColor} : ${lightColor}
  const metas = Array.from(document.querySelectorAll('meta[name="theme-color"]'))
  if (metas.length > 0) {
    metas[0].setAttribute('content', color)
    metas.slice(1).forEach((meta) => meta.remove())
  } else {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    meta.setAttribute('content', color)
    document.head.appendChild(meta)
  }
})()`
}
