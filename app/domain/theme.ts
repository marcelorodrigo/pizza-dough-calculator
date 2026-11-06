export type ThemePreference = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'theme'

export const THEME_COLORS: Record<ResolvedTheme, string> = {
  light: '#f5f2eb',
  dark: '#161311'
}

const THEME_PREFERENCES: readonly string[] = ['system', 'light', 'dark']

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && THEME_PREFERENCES.includes(value)
}

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean
): ResolvedTheme {
  return preference === 'dark' || (preference === 'system' && systemPrefersDark)
    ? 'dark'
    : 'light'
}
