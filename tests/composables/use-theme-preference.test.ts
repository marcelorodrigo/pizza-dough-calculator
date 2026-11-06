import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useThemePreference } from '../../app/composables/useThemePreference'
import type { ThemePreference } from '../../app/domain/theme'
import type { CalculatorStateStore } from '../../app/services/calculator-state-store'

/** Creates a stub store that returns the supplied saved value. */
function createStore(saved: unknown = null): CalculatorStateStore {
  return {
    load: vi.fn(() => saved),
    save: vi.fn()
  }
}

/** Mounts a component that exposes the theme controller for assertions. */
function mountTheme(store: CalculatorStateStore) {
  let controller: ReturnType<typeof useThemePreference> | undefined
  const component = defineComponent({
    setup() {
      controller = useThemePreference(store)
      return () => h('div')
    }
  })

  const wrapper = mount(component)
  return { wrapper, getController: () => controller! }
}

/** Installs a controllable matchMedia stub for system theme changes. */
function installMedia(initialMatches: boolean) {
  let listener: ((event: MediaQueryListEvent) => void) | undefined
  const media = {
    matches: initialMatches,
    addEventListener: vi.fn((event: string, callback: (event: MediaQueryListEvent) => void) => {
      if (event === 'change') listener = callback
    }),
    removeEventListener: vi.fn((event: string, callback: (event: MediaQueryListEvent) => void) => {
      if (event === 'change' && listener === callback) listener = undefined
    })
  }
  vi.stubGlobal('matchMedia', vi.fn(() => media))

  return {
    media,
    emit(matches: boolean) {
      media.matches = matches
      listener?.({ matches } as MediaQueryListEvent)
    }
  }
}

/** Returns whether the document currently has the dark theme class. */
function isDark() {
  return document.documentElement.classList.contains('dark')
}

/** Returns the current theme-color metadata value. */
function themeColor() {
  return document.querySelector('meta[name="theme-color"]')?.getAttribute('content')
}

describe('useThemePreference', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => meta.remove())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.documentElement.classList.remove('dark')
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => meta.remove())
  })

  it('restores a saved preference and applies it immediately', async () => {
    const store = createStore('dark')
    installMedia(false)

    const { getController } = mountTheme(store)
    await nextTick()

    expect(store.load).toHaveBeenCalledWith('theme')
    expect(getController().preference.value).toBe('dark')
    expect(getController().resolvedTheme.value).toBe('dark')
    expect(isDark()).toBe(true)
    expect(themeColor()).toBe('#161311')
  })

  it('falls back to the system preference for invalid saved data', async () => {
    const store = createStore('sepia')
    installMedia(true)

    const { getController } = mountTheme(store)
    await nextTick()

    expect(getController().preference.value).toBe('system')
    expect(getController().resolvedTheme.value).toBe('dark')
    expect(isDark()).toBe(true)
  })

  it('persists manual choices and applies them', async () => {
    const store = createStore(null)
    installMedia(false)
    const { getController } = mountTheme(store)
    await nextTick()
    expect(isDark()).toBe(false)

    getController().setPreference('dark')
    await nextTick()
    expect(store.save).toHaveBeenLastCalledWith('theme', 'dark')
    expect(isDark()).toBe(true)
    expect(themeColor()).toBe('#161311')

    getController().setPreference('light')
    await nextTick()
    expect(store.save).toHaveBeenLastCalledWith('theme', 'light')
    expect(isDark()).toBe(false)
    expect(themeColor()).toBe('#f5f2eb')
  })

  it('updates with the system only while the system preference is selected', async () => {
    const store = createStore(null)
    const media = installMedia(false)
    const { getController } = mountTheme(store)
    await nextTick()
    expect(isDark()).toBe(false)

    media.emit(true)
    await nextTick()
    expect(isDark()).toBe(true)

    getController().setPreference('light')
    await nextTick()
    media.emit(true)
    media.emit(false)
    await nextTick()
    expect(isDark()).toBe(false)
  })

  it('retains the latest system setting while a manual theme is selected', async () => {
    const store = createStore(null)
    const media = installMedia(false)
    const { getController } = mountTheme(store)
    await nextTick()

    getController().setPreference('light')
    await nextTick()
    media.emit(true)
    await nextTick()
    expect(getController().resolvedTheme.value).toBe('light')

    getController().setPreference('system')
    await nextTick()
    expect(getController().resolvedTheme.value).toBe('dark')
    expect(isDark()).toBe(true)
  })

  it('removes the system listener when unmounted', () => {
    const store = createStore(null)
    const media = installMedia(false)
    const { wrapper } = mountTheme(store)

    wrapper.unmount()

    expect(media.media.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('ignores unsupported preference values without saving them', async () => {
    const store = createStore(null)
    installMedia(false)
    const { getController } = mountTheme(store)
    await nextTick()

    expect(() => getController().setPreference('sepia' as ThemePreference)).not.toThrow()
    expect(store.save).not.toHaveBeenCalled()
    expect(getController().preference.value).toBe('system')
  })
})
