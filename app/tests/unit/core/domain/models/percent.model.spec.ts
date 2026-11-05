import { describe, expect, it } from 'vitest';
import { clampPercent } from '../../../../../core/domain/models/percent.model';

describe('clampPercent', () => {
  it.each([
    [0, 0],
    [62, 62],
    [62.5, 62.5],
    [100, 100],
  ])('deve manter %s quando o valor esta entre 0 e 100', (value, expected) => {
    // Act
    const result = clampPercent(value);

    // Assert
    expect(result).toBe(expected);
  });

  it('deve limitar a 100 quando o valor passa de 100', () => {
    // Act
    const result = clampPercent(130);

    // Assert
    expect(result).toBe(100);
  });

  it('deve limitar a 0 quando o valor e negativo', () => {
    // Act
    const result = clampPercent(-5);

    // Assert
    expect(result).toBe(0);
  });
});
