import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'src/hooks';

export enum Theme {
  Light = 'light-theme',
  Dark = 'dark-theme',
}

export enum ThemeOption {
  Light = 'light-theme',
  Dark = 'dark-theme',
  System = 'system',
}

const computeSystemTheme = () => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return Theme.Dark
  } else {
    return Theme.Light
  }
}

export const useTheme = () => {
  const savedTheme = useSelector(state => state.userData.settings?.theme ?? ThemeOption.System)
  const [systemTheme, setSystemTheme] = useState<Theme>(computeSystemTheme)

  useEffect(() => {
    // Listen for change in system settings
    const mediaMatch = window.matchMedia('(prefers-color-scheme: dark)')

    mediaMatch.onchange = (event) => {
      const newTheme = event.matches ? Theme.Dark : Theme.Light
      setSystemTheme(newTheme)
    }
    return () => {
      mediaMatch.onchange = null
    }
  }, [])

  const theme: Theme = useMemo(() => (
    savedTheme === undefined || savedTheme === ThemeOption.System ? systemTheme : (savedTheme as unknown as Theme)
  ), [savedTheme, systemTheme])

  return {
    theme,
    themeOption: savedTheme,
  }
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme()

  useEffect(() => {
    document.body.classList.add(theme)
    return () => document.body.classList.remove(theme)
  }, [theme])

  return (
    <>{children}</>
  )
}
