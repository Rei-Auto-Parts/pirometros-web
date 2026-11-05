import type { PyrometerDto } from '../dtos/pyrometer.dto';

type Named = Pick<PyrometerDto, 'id' | 'name' | 'nickname'>;

function present(value: string | null): string | null {
  return value !== null && value.trim() !== '' ? value : null;
}

/** A tag do pirometro: o nome do aparelho, ou o serial quando nao ha nome. */
function tagOf(pyrometer: Named): string {
  return present(pyrometer.name) ?? pyrometer.id;
}

export interface DisplayParts {
  readonly tag: string;
  readonly nickname: string | null;
}

/** A tag e o apelido separados, para a tela dar pesos diferentes a cada um. */
export function displayParts(pyrometer: Named): DisplayParts {
  return { tag: tagOf(pyrometer), nickname: present(pyrometer.nickname) };
}

/** Nome mostrado em toda tela: `TAG - APELIDO`; sem apelido, so a tag. O apelido nao substitui a tag. */
export function displayName(pyrometer: Named): string {
  const { tag, nickname } = displayParts(pyrometer);
  return nickname === null ? tag : `${tag} - ${nickname}`;
}

export function onlyActive(pyrometers: readonly PyrometerDto[]): PyrometerDto[] {
  return pyrometers.filter((pyrometer) => pyrometer.active);
}

export function sortByDisplayName(pyrometers: readonly PyrometerDto[]): PyrometerDto[] {
  return [...pyrometers].sort((a, b) =>
    displayName(a).localeCompare(displayName(b), 'pt-BR', { sensitivity: 'base' }),
  );
}

export function findPyrometer(
  pyrometers: readonly PyrometerDto[],
  id: string | null,
): PyrometerDto | undefined {
  return id === null ? undefined : pyrometers.find((pyrometer) => pyrometer.id === id);
}

/** Nome de um serial: o da lista de pirometros, senao o de reserva, senao o proprio serial. */
export function resolveName(
  pyrometers: readonly PyrometerDto[],
  id: string | null,
  fallbackName: string | null,
): string {
  const found = findPyrometer(pyrometers, id);
  if (found !== undefined) return displayName(found);
  return present(fallbackName) ?? id ?? '';
}
