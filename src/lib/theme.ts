import { useCallback, useEffect, useState } from 'react'

export type ThemePref = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'grimorio-theme'
const MEDIA = '(prefers-color-scheme: dark)'

export function getStoredTheme(): ThemePref {
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'light' || value === 'dark' || value === 'system'
    ? value
    : 'dark'
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia(MEDIA).matches ? 'dark' : 'light'
}

function applyTheme(theme: ResolvedTheme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(getStoredTheme)
  const [system, setSystem] = useState<ResolvedTheme>(systemTheme)

  const resolved: ResolvedTheme = pref === 'system' ? system : pref

  // Sincroniza o DOM e a preferência salva.
  useEffect(() => {
    applyTheme(resolved)
    localStorage.setItem(STORAGE_KEY, pref)
  }, [pref, resolved])

  // Acompanha mudanças de tema do sistema operacional.
  useEffect(() => {
    const media = window.matchMedia(MEDIA)
    const onChange = (event: MediaQueryListEvent) => {
      setSystem(event.matches ? 'dark' : 'light')
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const set = useCallback((value: ThemePref) => setPref(value), [])

  return { pref, resolved, setPref: set }
}

export const THEME_OPTIONS: { value: ThemePref; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
]
