import type { ReadingPeriodDto } from '../dtos/reading-period.dto';
import { toEpochSeconds } from './reg-date.model';

export interface ChartAxis {
  readonly domain: readonly [number, number];
  readonly ticks: readonly number[];
  /** Mostra `dd/MM` junto da hora quando o periodo cruza a meia-noite. */
  readonly withDate: boolean;
}

const HOUR = 3600;
/** Passo das marcas conforme a duracao: ate 2 h, 15 min; ate 8 h, 1 h; ate 36 h, 3 h; senao 12 h. */
const STEPS: ReadonlyArray<readonly [number, number]> = [
  [2 * HOUR, 900],
  [8 * HOUR, HOUR],
  [36 * HOUR, 3 * HOUR],
];
const LONG_STEP = 12 * HOUR;

function stepFor(span: number): number {
  return STEPS.find(([limit]) => span <= limit)?.[1] ?? LONG_STEP;
}

export function buildChartAxis(period: ReadingPeriodDto): ChartAxis {
  const start = toEpochSeconds(period.start);
  const end = toEpochSeconds(period.end) + 1;
  const step = stepFor(end - start);
  const ticks: number[] = [];
  for (let tick = Math.ceil(start / step) * step; tick <= end; tick += step) {
    ticks.push(tick);
  }
  return {
    domain: [start, end],
    ticks,
    withDate: period.start.slice(0, 10) !== period.end.slice(0, 10),
  };
}
