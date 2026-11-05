import { describe, expect, it } from 'vitest';
import { getChartPeriod } from '../../../../../core/domain/models/chart-period.model';

const NOW = new Date(2026, 10, 5, 10, 8, 30);

describe('getChartPeriod', () => {
  it('deve cobrir 00:00 a 23:59 do dia quando o periodo e Hoje', () => {
    // Act
    const period = getChartPeriod('today', NOW);

    // Assert
    expect(period).toEqual({ start: '2026-11-05T00:00:00', end: '2026-11-05T23:59:59' });
  });

  it('deve voltar uma hora ate agora quando o periodo e Ultima hora', () => {
    // Act
    const period = getChartPeriod('hour', NOW);

    // Assert
    expect(period).toEqual({ start: '2026-11-05T09:08:30', end: '2026-11-05T10:08:30' });
  });

  it('deve voltar seis horas ate agora quando o periodo e Ultimas 6 horas', () => {
    // Act
    const period = getChartPeriod('sixHours', NOW);

    // Assert
    expect(period).toEqual({ start: '2026-11-05T04:08:30', end: '2026-11-05T10:08:30' });
  });

  it('deve cruzar a meia-noite quando as 24 horas comecam no dia anterior', () => {
    // Act
    const period = getChartPeriod('day', NOW);

    // Assert
    expect(period).toEqual({ start: '2026-11-04T10:08:30', end: '2026-11-05T10:08:30' });
  });

  it('deve voltar tres dias ate agora quando o periodo e Ultimos 3 dias', () => {
    // Act
    const period = getChartPeriod('threeDays', NOW);

    // Assert
    expect(period).toEqual({ start: '2026-11-02T10:08:30', end: '2026-11-05T10:08:30' });
  });

  it('deve cruzar o ano quando as 24 horas comecam em 31 de dezembro', () => {
    // Arrange
    const newYear = new Date(2027, 0, 1, 1, 0, 0);

    // Act
    const period = getChartPeriod('day', newYear);

    // Assert
    expect(period).toEqual({ start: '2026-12-31T01:00:00', end: '2027-01-01T01:00:00' });
  });

  it('deve usar o relogio atual quando nenhuma hora e informada', () => {
    // Act
    const period = getChartPeriod('today');

    // Assert
    expect(period.start.endsWith('T00:00:00')).toBe(true);
  });
});
