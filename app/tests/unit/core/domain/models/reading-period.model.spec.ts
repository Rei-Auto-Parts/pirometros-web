import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getTodayPeriod,
  isPeriodValid,
} from '../../../../../core/domain/models/reading-period.model';

describe('getTodayPeriod', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve devolver o dia inteiro quando recebe uma data com horario', () => {
    // Arrange
    const now = new Date(2026, 9, 29, 15, 30);

    // Act
    const period = getTodayPeriod(now);

    // Assert
    expect(period).toEqual({ start: '2026-10-29T00:00:00', end: '2026-10-29T23:59:59' });
  });

  it('deve completar o dia com zero a esquerda quando o dia tem um digito', () => {
    // Arrange
    const now = new Date(2026, 10, 3, 9, 0);

    // Act
    const period = getTodayPeriod(now);

    // Assert
    expect(period).toEqual({ start: '2026-11-03T00:00:00', end: '2026-11-03T23:59:59' });
  });

  it('deve completar o mes com zero a esquerda quando o mes tem um digito', () => {
    // Arrange
    const now = new Date(2026, 0, 5, 12, 0);

    // Act
    const period = getTodayPeriod(now);

    // Assert
    expect(period).toEqual({ start: '2026-01-05T00:00:00', end: '2026-01-05T23:59:59' });
  });

  it('deve manter o ano da data quando e o ultimo dia do ano', () => {
    // Arrange
    const now = new Date(2026, 11, 31, 23, 59);

    // Act
    const period = getTodayPeriod(now);

    // Assert
    expect(period).toEqual({ start: '2026-12-31T00:00:00', end: '2026-12-31T23:59:59' });
  });

  it('deve avancar o ano quando e o primeiro dia do ano', () => {
    // Arrange
    const now = new Date(2027, 0, 1, 0, 0);

    // Act
    const period = getTodayPeriod(now);

    // Assert
    expect(period).toEqual({ start: '2027-01-01T00:00:00', end: '2027-01-01T23:59:59' });
  });

  it('deve usar o relogio atual quando nao recebe argumento', () => {
    // Arrange
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 3, 9, 0));

    // Act
    const period = getTodayPeriod();

    // Assert
    expect(period).toEqual({ start: '2026-11-03T00:00:00', end: '2026-11-03T23:59:59' });
  });
});

describe('isPeriodValid', () => {
  it('deve ser verdadeiro quando o inicio e anterior ao fim', () => {
    // Act
    const valid = isPeriodValid('2026-11-03T00:00:00', '2026-11-03T23:59:59');

    // Assert
    expect(valid).toBe(true);
  });

  it('deve ser verdadeiro quando o inicio e igual ao fim', () => {
    // Act
    const valid = isPeriodValid('2026-11-03T10:00:00', '2026-11-03T10:00:00');

    // Assert
    expect(valid).toBe(true);
  });

  it('deve ser falso quando o inicio e posterior ao fim', () => {
    // Act
    const valid = isPeriodValid('2026-11-04T00:00:00', '2026-11-03T23:59:59');

    // Assert
    expect(valid).toBe(false);
  });
});
