import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_THEME, type Theme } from '../../../core/domain/constants/theme.constants';
import { readStoredTheme, storeTheme } from '../../../infra/tools/theme-storage.tool';

export type { Theme };

/**
 * Abre no tema que o usuario escolheu e salvou (senao, no claro) e aplica a classe `dark` no `<html>`.
 * So grava ao alternar: o padrao nao conta como escolha. O script de `index.html` ja aplicou o tema
 * salvo antes da primeira pintura.
 */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme() ?? DEFAULT_THEME);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggle = useCallback(() => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    storeTheme(next);
    setTheme(next);
  }, [theme]);

  return { theme, toggle };
}
