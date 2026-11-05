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
});
