export type Theme = 'light' | 'dark';

/** Sem escolha salva, o sistema abre no claro. */
export const DEFAULT_THEME: Theme = 'light';

/** Chave do `localStorage`. O script de `index.html`, que evita piscar o tema errado, usa a mesma. */
export const THEME_STORAGE_KEY = 'pirometros.theme';

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}
