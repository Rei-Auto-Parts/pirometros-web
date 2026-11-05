import type { PyrometerDto } from '../dtos/pyrometer.dto';
import { displayName } from './pyrometer-name.model';

/**
 * Cores que outro pirometro ja usa (cor efetiva, inclusive a padrao): cor em minuscula -> nome mostrado
 * de quem a usa. Nao conta o proprio pirometro, cuja cor atual continua selecionavel.
 */
export function colorsInUse(
  pyrometers: readonly PyrometerDto[],
  ownerId: string,
): Map<string, string> {
  const used = new Map<string, string>();
  for (const pyrometer of pyrometers) {
    if (pyrometer.id !== ownerId) {
      used.set(pyrometer.color.toLowerCase(), displayName(pyrometer));
    }
  }
  return used;
}
