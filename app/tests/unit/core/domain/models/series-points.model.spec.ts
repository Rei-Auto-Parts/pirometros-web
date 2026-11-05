import { describe, expect, it } from 'vitest';
import { toEpochSeconds } from '../../../../../core/domain/models/reg-date.model';
import { toChartPoints } from '../../../../../core/domain/models/series-points.model';

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

  it('deve devolver um ponto por leitura, na mesma ordem, quando ha varias leituras', () => {
    // Act
    const result = toChartPoints([
      point('2026-11-05T10:00:00', 1),
      point('2026-11-05T10:05:00', 2),
      point('2026-11-05T10:10:00', 3),
    ]);

    // Assert
    expect(result.map((item) => item.temperature)).toEqual([1, 2, 3]);
  });

  it.each([
    ['15 minutos', '2026-11-05T10:15:00'],
    ['15 minutos e 1 segundo', '2026-11-05T10:15:01'],
    ['2 horas', '2026-11-05T12:00:00'],
    ['3 dias', '2026-11-08T10:00:00'],
  ])('deve ligar as leituras sem inserir ponto vazio quando elas distam %s', (_label, second) => {
    // Act
    const result = toChartPoints([point('2026-11-05T10:00:00', 1500), point(second, 1510)]);

    // Assert
    expect(result).toHaveLength(2);
    expect(result.every((item) => item.temperature !== null)).toBe(true);
  });

  it('deve manter o instante de cada leitura quando mapeia', () => {
    // Act
    const result = toChartPoints([
      point('2026-11-05T10:00:00', 1500),
      point('2026-11-05T12:00:00', 1510),
    ]);

    // Assert
    expect(result.map((item) => item.x)).toEqual([
      toEpochSeconds('2026-11-05T10:00:00'),
      toEpochSeconds('2026-11-05T12:00:00'),
    ]);
  });
});
