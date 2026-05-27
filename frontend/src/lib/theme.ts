export const THEME_KEY = 'lifeos-theme'
export type ThemeMode = 'light' | 'dark'

export function getInitialTheme(): ThemeMode {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'light' || saved === 'dark') {
    return saved
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
