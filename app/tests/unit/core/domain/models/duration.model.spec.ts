import { describe, expect, it } from 'vitest';
import { splitMinutes } from '../../../../../core/domain/models/duration.model';

describe('splitMinutes', () => {
  it.each([
    [0, { hours: 0, minutes: 0 }],
    [3, { hours: 0, minutes: 3 }],
    [59, { hours: 0, minutes: 59 }],
    [60, { hours: 1, minutes: 0 }],
    [65, { hours: 1, minutes: 5 }],
    [600, { hours: 10, minutes: 0 }],
  ])('deve dividir %i minutos em horas e minutos quando o valor e positivo', (total, expected) => {
    // Act
    const parts = splitMinutes(total);

    // Assert
    expect(parts).toEqual(expected);
  });

  it('deve tratar o valor negativo como zero quando a API devolve minutos negativos', () => {
    // Act
    const parts = splitMinutes(-5);

    // Assert
    expect(parts).toEqual({ hours: 0, minutes: 0 });
  });
});
