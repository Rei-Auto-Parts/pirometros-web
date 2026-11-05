import { describe, expect, it } from 'vitest';
import type { PyrometerDto } from '../../../../../core/domain/dtos/pyrometer.dto';
import { colorsInUse } from '../../../../../core/domain/models/pyrometer-color.model';

function build(
  id: string,
  name: string,
  color: string,
  overrides: Partial<PyrometerDto> = {},
): PyrometerDto {
  return { id, name, nickname: null, color, note: null, active: true, ...overrides };
}

describe('colorsInUse', () => {
  it('deve devolver a cor de cada outro pirometro com o nome de quem a usa quando ha varios', () => {
    // Arrange
    const list = [build('A', 'PI-12', '#2563eb'), build('B', 'PI-13', '#dc2626')];

    // Act
    const used = colorsInUse(list, 'A');

    // Assert
    expect([...used]).toEqual([['#dc2626', 'PI-13']]);
  });

  it('deve nao contar a cor do proprio pirometro quando ele e o dono', () => {
    // Arrange
    const list = [build('A', 'PI-12', '#2563eb')];

    // Act
    const used = colorsInUse(list, 'A');

    // Assert
    expect(used.size).toBe(0);
  });

  it('deve comparar sem diferenciar maiuscula quando a cor vem em caixa alta', () => {
    // Arrange
    const list = [build('B', 'PI-13', '#DC2626')];

    // Act
    const used = colorsInUse(list, 'A');

    // Assert
    expect(used.get('#dc2626')).toBe('PI-13');
  });

  it('deve usar o nome mostrado com apelido quando o outro pirometro tem apelido', () => {
    // Arrange
    const list = [build('B', 'PI-13', '#dc2626', { nickname: 'Forno 3' })];

    // Act
    const used = colorsInUse(list, 'A');

    // Assert
    expect(used.get('#dc2626')).toBe('PI-13 - Forno 3');
  });

  it('deve contar tambem os pirometros inativos quando eles usam a cor', () => {
    // Arrange
    const list = [build('B', 'PI-15', '#16a34a', { active: false })];

    // Act
    const used = colorsInUse(list, 'A');

    // Assert
    expect(used.get('#16a34a')).toBe('PI-15');
  });

  it('deve devolver vazio quando nao ha pirometros', () => {
    // Act
    const used = colorsInUse([], 'A');

    // Assert
    expect(used.size).toBe(0);
  });
});
