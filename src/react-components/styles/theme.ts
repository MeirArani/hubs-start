import { store } from '#/store/store';
import {
  tryGetTheme,
  getCurrentTheme,
  registerDarkModeQuery,
} from '#/utils/theme';
import { useSelector } from '@tanstack/react-store';
import { useCallback, useEffect, useState, type ReactNode } from 'react';

function useDarkMode() {
  const [darkMode, setDarkMode] = useState(false);

  const changeListener = useCallback(
    (event: MediaQueryListEvent) => {
      setDarkMode(event.matches);
    },
    [setDarkMode],
  );

  useEffect(() => {
    const [darkModeQuery, removeListener] =
      registerDarkModeQuery(changeListener);

    setDarkMode(darkModeQuery.matches);

    return removeListener;
  }, [changeListener]);

  return darkMode;
}

export function useTheme(themeId: string) {
  const darkMode = useDarkMode();

  useEffect(() => {
    const theme = tryGetTheme(themeId);

    if (!theme) {
      return;
    }

    const variables = [];

    for (const key in theme.variables) {
      if (!Object.prototype.hasOwnProperty.call(theme.variables, key)) continue;
      variables.push(`--${key}: ${theme.variables[key]};`);
    }

    const styleTag = document.createElement('style');

    styleTag.innerHTML = `:root {
        ${variables.join('\n')}
      }`;

    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, [themeId, darkMode]);
}

function getAppLogo(darkMode: boolean) {
  const theme = getCurrentTheme();
  const shouldUseDarkLogo = theme
    ? theme.darkModeDefault || theme.id.includes('dark-mode')
    : darkMode;
  //   return (shouldUseDarkLogo && getImage('logo_dark')) || getImage('logo')
  return null;
}

export function useLogo() {
  const darkMode = useDarkMode();
  return getAppLogo(darkMode);
}

export function useThemeFromStore() {
  const themeId = useSelector(store, (state) => state.preferences.theme);

  useTheme(themeId);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useThemeFromStore();
  return children;
}
