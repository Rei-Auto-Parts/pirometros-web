import { describe, expect, it } from 'vitest';
import { buildChartAxis } from '../../../../../core/domain/models/chart-axis.model';
import { toEpochSeconds } from '../../../../../core/domain/models/reg-date.model';

describe('buildChartAxis', () => {
  it('deve ir de meia-noite a meia-noite com marcas de 3 em 3 horas quando o periodo e um dia', () => {
    // Arrange
    const period = { start: '2026-11-05T00:00:00', end: '2026-11-05T23:59:59' };
    const midnight = toEpochSeconds('2026-11-05T00:00:00');

    // Act
    const axis = buildChartAxis(period);

    // Assert
    expect(axis.domain).toEqual([midnight, midnight + 86400]);
    expect(axis.ticks).toHaveLength(9);
    expect(axis.ticks[1]).toBe(midnight + 10800);
    expect(axis.withDate).toBe(false);
  });

  it('deve marcar de 15 em 15 minutos quando o periodo e uma hora', () => {
    // Arrange
    const period = { start: '2026-11-05T09:08:30', end: '2026-11-05T10:08:30' };

    // Act
    const axis = buildChartAxis(period);

    // Assert
    expect(axis.ticks.every((tick) => tick % 900 === 0)).toBe(true);
    expect(axis.ticks).toHaveLength(4);
    expect(axis.withDate).toBe(false);
  });

  it('deve marcar de hora em hora quando o periodo e de seis horas', () => {
    // Arrange
    const period = { start: '2026-11-05T04:08:30', end: '2026-11-05T10:08:30' };

    // Act
    const axis = buildChartAxis(period);

    // Assert
    expect(axis.ticks.every((tick) => tick % 3600 === 0)).toBe(true);
    expect(axis.ticks).toHaveLength(6);
  });

  it('deve mostrar a data nas marcas quando as 24 horas cruzam a meia-noite', () => {
    // Arrange
    const period = { start: '2026-11-04T10:08:30', end: '2026-11-05T10:08:30' };

    // Act
    const axis = buildChartAxis(period);

    // Assert
    expect(axis.withDate).toBe(true);
    expect(axis.ticks.every((tick) => tick % 10800 === 0)).toBe(true);
  });

  it('deve marcar de 12 em 12 horas quando o periodo e de tres dias', () => {
    // Arrange
    const period = { start: '2026-11-02T10:08:30', end: '2026-11-05T10:08:30' };

    // Act
    const axis = buildChartAxis(period);

    // Assert
    expect(axis.ticks.every((tick) => tick % 43200 === 0)).toBe(true);
    expect(axis.withDate).toBe(true);
  });

  it('deve manter todas as marcas dentro do dominio quando o periodo e qualquer um', () => {
    // Arrange
    const period = { start: '2026-11-04T10:08:30', end: '2026-11-05T10:08:30' };

    // Act
    const axis = buildChartAxis(period);

    // Assert
    const [low, high] = axis.domain;
    expect(axis.ticks.every((tick) => tick >= low && tick <= high)).toBe(true);
  });

  describe('com a extensao real das leituras', () => {
    const DAY = { start: '2026-11-05T00:00:00', end: '2026-11-05T23:59:59' };
    const at = (value: string): number => toEpochSeconds(value);

    it('deve ir da primeira a ultima leitura com folga minima de 5 minutos quando a extensao e curta', () => {
      // Arrange
      const extent = { min: at('2026-11-05T10:00:00'), max: at('2026-11-05T10:14:00') };

      // Act
      const axis = buildChartAxis(DAY, extent);

      // Assert
      expect(axis.domain).toEqual([at('2026-11-05T09:55:00'), at('2026-11-05T10:19:00')]);
    });

    it('deve usar folga de 2% da extensao quando a extensao e longa', () => {
      // Arrange
      const min = at('2026-11-05T00:00:00');
      const extent = { min, max: min + 20 * 3600 };

      // Act
      const axis = buildChartAxis(DAY, extent);

      // Assert
      expect(axis.domain).toEqual([min - 1440, min + 20 * 3600 + 1440]);
    });

    it('deve abrir 5 minutos para cada lado quando ha uma leitura so', () => {
      // Arrange
      const instant = at('2026-11-05T10:00:00');

      // Act
      const axis = buildChartAxis(DAY, { min: instant, max: instant });

      // Assert
      expect(axis.domain).toEqual([instant - 300, instant + 300]);
    });

    it('deve marcar de 5 em 5 minutos dentro do dominio quando a extensao e de poucos minutos', () => {
      // Arrange
      const extent = { min: at('2026-11-05T10:00:00'), max: at('2026-11-05T10:14:00') };

      // Act
      const axis = buildChartAxis(DAY, extent);

      // Assert
      expect(axis.ticks.length).toBeGreaterThanOrEqual(3);
      expect(axis.ticks.every((tick) => tick % 300 === 0)).toBe(true);
      const [low, high] = axis.domain;
      expect(axis.ticks.every((tick) => tick >= low && tick <= high)).toBe(true);
    });

    it('deve ignorar a janela do periodo quando ha leituras', () => {
      // Arrange
      const threeDays = { start: '2026-11-02T10:00:00', end: '2026-11-05T10:00:00' };
      const extent = { min: at('2026-11-05T09:00:00'), max: at('2026-11-05T10:00:00') };

      // Act
      const axis = buildChartAxis(threeDays, extent);

      // Assert
      expect(axis.domain[0]).toBeGreaterThan(at('2026-11-05T08:00:00'));
      expect(axis.withDate).toBe(false);
    });

    it('deve mostrar a data nas marcas quando as leituras cruzam a meia-noite', () => {
      // Arrange
      const extent = { min: at('2026-11-04T22:00:00'), max: at('2026-11-05T02:00:00') };

      // Act
      const axis = buildChartAxis(DAY, extent);

      // Assert
      expect(axis.withDate).toBe(true);
    });

    it('deve usar a janela do periodo quando nao ha extensao', () => {
      // Act
      const withoutExtent = buildChartAxis(DAY);
      const withNull = buildChartAxis(DAY, null);

      // Assert
      expect(withNull).toEqual(withoutExtent);
      expect(withNull.domain).toEqual([
        at('2026-11-05T00:00:00'),
        at('2026-11-05T00:00:00') + 86400,
      ]);
    });
  });
});
