import { describe, expect, it } from 'vitest';
import { toChartPoints } from '../../../../../core/domain/models/series-gap.model';
import { toEpochSeconds } from '../../../../../core/domain/models/reg-date.model';

const point = (measuredAt: string, temperature: number) => ({ measuredAt, temperature });

describe('toChartPoints', () => {
  it('deve devolver lista vazia quando nao ha pontos', () => {
    // Act
    const result = toChartPoints([]);

    // Assert
    expect(result).toEqual([]);
  });

  it('deve devolver um ponto quando ha so uma leitura', () => {
    // Act
    const result = toChartPoints([point('2026-11-05T10:00:00', 1500)]);

    // Assert
    expect(result).toEqual([{ x: toEpochSeconds('2026-11-05T10:00:00'), temperature: 1500 }]);
  });

  it('deve ligar os pontos quando a diferenca e exatamente 15 minutos', () => {
    // Act
    const result = toChartPoints([
      point('2026-11-05T10:00:00', 1500),
      point('2026-11-05T10:15:00', 1510),
    ]);

    // Assert
    expect(result.map((item) => item.temperature)).toEqual([1500, 1510]);
  });

  it('deve interromper a linha quando a diferenca passa de 15 minutos por um segundo', () => {
    // Act
    const result = toChartPoints([
      point('2026-11-05T10:00:00', 1500),
      point('2026-11-05T10:15:01', 1510),
    ]);

    // Assert
    expect(result.map((item) => item.temperature)).toEqual([1500, null, 1510]);
  });

  it('deve colocar o ponto nulo entre os dois pontos quando ha lacuna', () => {
    // Arrange
    const first = toEpochSeconds('2026-11-05T10:00:00');
    const second = toEpochSeconds('2026-11-05T12:00:00');

    // Act
    const result = toChartPoints([
      point('2026-11-05T10:00:00', 1500),
      point('2026-11-05T12:00:00', 1510),
    ]);

    // Assert
    const gap = result[1];
    expect(gap?.x).toBeGreaterThan(first);
    expect(gap?.x).toBeLessThan(second);
  });

  it('deve quebrar so onde ha lacuna quando ha varias leituras', () => {
    // Act
    const result = toChartPoints([
      point('2026-11-05T10:00:00', 1),
      point('2026-11-05T10:05:00', 2),
      point('2026-11-05T11:00:00', 3),
      point('2026-11-05T11:05:00', 4),
    ]);

    // Assert
    expect(result.map((item) => item.temperature)).toEqual([1, 2, null, 3, 4]);
  });

  it('deve respeitar o limite informado quando ele e diferente do padrao', () => {
    // Act
    const result = toChartPoints(
      [point('2026-11-05T10:00:00', 1), point('2026-11-05T10:02:00', 2)],
      60,
    );

    // Assert
    expect(result.map((item) => item.temperature)).toEqual([1, null, 2]);
  });
});
