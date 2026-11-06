import { describe, expect, it } from 'vitest'
import {
  isThemePreference,
  resolveTheme,
  THEME_COLORS
} from '../../app/domain/theme'

describe('theme domain', () => {
  it('accepts only the supported theme preferences', () => {
    expect(isThemePreference('system')).toBe(true)
    expect(isThemePreference('light')).toBe(true)
    expect(isThemePreference('dark')).toBe(true)

    expect(isThemePreference('auto')).toBe(false)
    expect(isThemePreference('')).toBe(false)
    expect(isThemePreference(null)).toBe(false)
    expect(isThemePreference(undefined)).toBe(false)
    expect(isThemePreference(1)).toBe(false)
    expect(isThemePreference({ theme: 'dark' })).toBe(false)
  })

  it('resolves the system preference and explicit overrides', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('light', false)).toBe('light')
    expect(resolveTheme('dark', true)).toBe('dark')
    expect(resolveTheme('dark', false)).toBe('dark')
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
  })

  it('defines browser theme colors for both resolved themes', () => {
    expect(THEME_COLORS).toEqual({
      light: '#f5f2eb',
      dark: '#161311'
    })
  })
})
