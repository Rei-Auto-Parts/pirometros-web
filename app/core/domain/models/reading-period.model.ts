import type { ReadingPeriodDto } from '../dtos/reading-period.dto';

const pad = (value: number): string => String(value).padStart(2, '0');

/** Dia de hoje (00:00 a 23:59) pelo relogio local; so descobre o dia, nao converte datas. */
export function getTodayPeriod(now: Date = new Date()): ReadingPeriodDto {
  const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return { start: `${day}T00:00:00`, end: `${day}T23:59:59` };
}

/** Compara textos no mesmo formato, sem `Date`. */
export function isPeriodValid(start: string, end: string): boolean {
  return start <= end;
}
