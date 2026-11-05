import { describe, expect, it } from 'vitest';
import {
  endOfMinute,
  formatClock,
  formatEpoch,
  formatRegDate,
  secondsOfDay,
  startOfMinute,
  toEpochSeconds,
} from '../../../../../core/domain/models/reg-date.model';

describe('formatRegDate', () => {
  it('deve formatar dia, mes, ano e hora sem segundos quando o valor tem segundos', () => {
    // Arrange
    const value: string = '2026-10-29T11:00:30';

    // Act
    const formatted: string = formatRegDate(value);

    // Assert
    expect(formatted).toBe('29/10/2026 11:00');
  });

  it('deve manter a hora local sem converter fuso quando o valor e meia-noite', () => {
    // Arrange
    const value: string = '2026-10-29T00:00:00';

    // Act
    const formatted: string = formatRegDate(value);

    // Assert
    expect(formatted).toBe('29/10/2026 00:00');
  });

  it('deve devolver apenas a data quando o valor nao tem hora', () => {
    // Arrange
    const value: string = '2026-10-29';

    // Act
    const formatted: string = formatRegDate(value);

    // Assert
    expect(formatted).toBe('29/10/2026');
  });
});

describe('secondsOfDay', () => {
  it('deve somar horas, minutos e segundos quando o valor tem hora completa', () => {
    // Arrange
    const value: string = '2026-10-29T01:02:03';

    // Act
    const seconds: number = secondsOfDay(value);

    // Assert
    expect(seconds).toBe(3723);
  });

  it('deve devolver zero quando o valor e meia-noite', () => {
    // Arrange
    const value: string = '2026-10-29T00:00:00';

    // Act
    const seconds: number = secondsOfDay(value);

    // Assert
    expect(seconds).toBe(0);
  });

  it('deve devolver 86399 quando o valor e 23:59:59', () => {
    // Arrange
    const value: string = '2026-10-29T23:59:59';

    // Act
    const seconds: number = secondsOfDay(value);

    // Assert
    expect(seconds).toBe(86399);
  });

  it('deve tratar segundos ausentes como zero quando o valor tem so hora e minuto', () => {
    // Arrange
    const value: string = '2026-10-29T10:30';

    // Act
    const seconds: number = secondsOfDay(value);

    // Assert
    expect(seconds).toBe(37800);
  });

  it('deve devolver zero quando o valor nao tem hora', () => {
    // Arrange
    const value: string = '2026-10-29';

    // Act
    const seconds: number = secondsOfDay(value);

    // Assert
    expect(seconds).toBe(0);
  });
});

describe('formatClock', () => {
  it('deve formatar HH:mm quando os segundos somam horas e minutos', () => {
    // Arrange
    const seconds: number = 3600 * 14 + 60 * 2;

    // Act
    const clock: string = formatClock(seconds);

    // Assert
    expect(clock).toBe('14:02');
  });

  it('deve devolver 00:00 quando os segundos sao zero', () => {
    // Act
    const clock: string = formatClock(0);

    // Assert
    expect(clock).toBe('00:00');
  });

  it('deve descartar os segundos restantes quando o valor e 23:59:59', () => {
    // Act
    const clock: string = formatClock(86399);

    // Assert
    expect(clock).toBe('23:59');
  });
});

describe('startOfMinute', () => {
  it('deve acrescentar segundos zero quando o valor e meia-noite', () => {
    // Arrange
    const value: string = '2026-10-29T00:00';

    // Act
    const start: string = startOfMinute(value);

    // Assert
    expect(start).toBe('2026-10-29T00:00:00');
  });

  it('deve ignorar os segundos recebidos quando o valor ja os traz', () => {
    // Arrange
    const value: string = '2026-10-29T11:05:42';

    // Act
    const start: string = startOfMinute(value);

    // Assert
    expect(start).toBe('2026-10-29T11:05:00');
  });
});

describe('endOfMinute', () => {
  it('deve acrescentar segundos 59 quando o valor e 23:59', () => {
    // Arrange
    const value: string = '2026-10-29T23:59';

    // Act
    const end: string = endOfMinute(value);

    // Assert
    expect(end).toBe('2026-10-29T23:59:59');
  });

  it('deve ignorar os segundos recebidos quando o valor ja os traz', () => {
    // Arrange
    const value: string = '2026-10-29T11:05:07';

    // Act
    const end: string = endOfMinute(value);

    // Assert
    expect(end).toBe('2026-10-29T11:05:59');
  });
});

describe('toEpochSeconds', () => {
  it('deve devolver zero quando o valor e o inicio de 01/01/1970', () => {
    // Act
    const seconds: number = toEpochSeconds('1970-01-01T00:00:00');

    // Assert
    expect(seconds).toBe(0);
  });

  it('deve somar os segundos do dia quando o valor tem hora', () => {
    // Act
    const seconds: number = toEpochSeconds('1970-01-02T01:02:03');

    // Assert
    expect(seconds).toBe(86400 + 3723);
  });

  it('deve contar o dia 29 de fevereiro quando o ano e bissexto', () => {
    // Arrange
    const feb29: number = toEpochSeconds('2028-02-29T00:00:00');
    const mar01: number = toEpochSeconds('2028-03-01T00:00:00');

    // Act
    const difference: number = mar01 - feb29;

    // Assert
    expect(difference).toBe(86400);
  });

  it('deve pular fevereiro sem dia 29 quando o ano nao e bissexto', () => {
    // Arrange
    const feb28: number = toEpochSeconds('2027-02-28T00:00:00');
    const mar01: number = toEpochSeconds('2027-03-01T00:00:00');

    // Act
    const difference: number = mar01 - feb28;

    // Assert
    expect(difference).toBe(86400);
  });

  it('deve avancar um dia quando passa a virada do ano', () => {
    // Arrange
    const dec31: number = toEpochSeconds('2026-12-31T00:00:00');
    const jan01: number = toEpochSeconds('2027-01-01T00:00:00');

    // Act
    const difference: number = jan01 - dec31;

    // Assert
    expect(difference).toBe(86400);
  });

  it('deve valer 1.7 bilhao de segundos quando o valor e 14/11/2023 22:13:20', () => {
    // Act
    const seconds: number = toEpochSeconds('2023-11-14T22:13:20');

    // Assert
    expect(seconds).toBe(1_700_000_000);
  });
});

describe('formatEpoch', () => {
  it('deve mostrar so a hora quando a data nao e pedida', () => {
    // Arrange
    const seconds: number = toEpochSeconds('2026-11-05T14:02:59');

    // Act
    const text: string = formatEpoch(seconds, false);

    // Assert
    expect(text).toBe('14:02');
  });

  it('deve mostrar dia, mes e hora quando a data e pedida', () => {
    // Arrange
    const seconds: number = toEpochSeconds('2026-11-05T14:02:59');

    // Act
    const text: string = formatEpoch(seconds, true);

    // Assert
    expect(text).toBe('05/11 14:02');
  });

  it('deve voltar ao mesmo texto quando ida e volta passam por toEpochSeconds', () => {
    // Arrange
    const seconds: number = toEpochSeconds('2028-02-29T23:59:00');

    // Act
    const text: string = formatEpoch(seconds, true);

    // Assert
    expect(text).toBe('29/02 23:59');
  });

  it('deve mostrar 01/01 quando o instante e a virada do ano', () => {
    // Arrange
    const seconds: number = toEpochSeconds('2027-01-01T00:00:00');

    // Act
    const text: string = formatEpoch(seconds, true);

    // Assert
    expect(text).toBe('01/01 00:00');
  });
});
