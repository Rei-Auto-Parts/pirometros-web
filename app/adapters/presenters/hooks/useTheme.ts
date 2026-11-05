import { useCallback, useState } from 'react';

export type Theme = 'light' | 'dark';

/** Abre sempre no claro; alterna a classe `dark` no `<html>`. */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>('light');
  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  }, []);
  return { theme, toggle };
}
