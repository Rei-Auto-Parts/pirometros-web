import {
  isTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from '../../core/domain/constants/theme.constants';

/**
 * Le a escolha de tema salva. Armazenamento bloqueado, ausente ou com valor invalido nao quebra:
 * devolve `null` (sem escolha salva).
 */
export function readStoredTheme(storage?: Storage): Theme | null {
  try {
    const value = (storage ?? localStorage).getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

/** Grava a escolha do usuario. Se o navegador nao deixar, o tema vale so nesta sessao, sem erro. */
export function storeTheme(theme: Theme, storage?: Storage): void {
  try {
    (storage ?? localStorage).setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Sem armazenamento: a escolha nao sobrevive ao F5, mas o tema continua funcionando.
  }
}
