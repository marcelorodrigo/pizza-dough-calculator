import { computed, onMounted, onUnmounted, ref, watch, type ComputedRef, type Ref } from 'vue'
import {
  isThemePreference,
  resolveTheme,
  THEME_COLORS,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference
} from '../domain/theme'
import type { CalculatorStateStore } from '../services/calculator-state-store'

interface ThemePreferenceController {
  preference: Ref<ThemePreference>
  resolvedTheme: ComputedRef<ResolvedTheme>
  setPreference: (value: ThemePreference) => void
}

const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'

function getMediaQuery(): MediaQueryList | null {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(DARK_MEDIA_QUERY)
    : null
}

function applyTheme(theme: ResolvedTheme) {
  if (typeof document === 'undefined') return

  document.documentElement.classList.toggle('dark', theme === 'dark')
  const color = THEME_COLORS[theme]
  const metas = Array.from(document.querySelectorAll('meta[name="theme-color"]'))

  const first = metas[0]
  if (first) {
    metas.slice(1).forEach(meta => meta.remove())
    first.setAttribute('content', color)
    return
  }

  if (document.head) {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    meta.setAttribute('content', color)
    document.head.appendChild(meta)
  }
}

export function useThemePreference(store?: CalculatorStateStore): ThemePreferenceController {
  const stateStore = store ?? useNuxtApp().$calculatorStateStore
  const saved = stateStore.load(THEME_STORAGE_KEY)
  const preference = ref<ThemePreference>(isThemePreference(saved) ? saved : 'system')
  const mediaQuery = getMediaQuery()
  const systemPrefersDark = ref(mediaQuery?.matches ?? false)
  const resolvedTheme = computed<ResolvedTheme>(() =>
    resolveTheme(preference.value, systemPrefersDark.value)
  )

  function onSystemThemeChange(event: MediaQueryListEvent) {
    if (preference.value === 'system') systemPrefersDark.value = event.matches
  }

  watch(resolvedTheme, theme => applyTheme(theme), { immediate: true })

  onMounted(() => {
    mediaQuery?.addEventListener('change', onSystemThemeChange)
  })

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', onSystemThemeChange)
  })

  function setPreference(value: ThemePreference) {
    if (!isThemePreference(value)) return
    preference.value = value
    stateStore.save(THEME_STORAGE_KEY, value)
  }

  return { preference, resolvedTheme, setPreference }
}
