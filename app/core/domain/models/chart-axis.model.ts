import type { ReadingPeriodDto } from '../dtos/reading-period.dto';
import { toEpochSeconds } from './reg-date.model';

export interface ChartAxis {
  readonly domain: readonly [number, number];
  readonly ticks: readonly number[];
  /** Mostra `dd/MM` junto da hora quando o periodo cruza a meia-noite. */
  readonly withDate: boolean;
}

const HOUR = 3600;
const DAY_SECONDS = 86400;
/** Folga de cada lado da extensao das leituras: 2% dela, no minimo 5 minutos. */
const PADDING_RATIO = 0.02;
const MIN_PADDING = 300;
/** Passo das marcas conforme a duracao: ate 30 min, 5 min; ate 2 h, 15 min; ate 8 h, 1 h; ate 36 h, 3 h; senao 12 h. */
const STEPS: ReadonlyArray<readonly [number, number]> = [
  [HOUR / 2, 300],
  [2 * HOUR, 900],
  [8 * HOUR, HOUR],
  [36 * HOUR, 3 * HOUR],
];
const LONG_STEP = 12 * HOUR;

function stepFor(span: number): number {
  return STEPS.find(([limit]) => span <= limit)?.[1] ?? LONG_STEP;
}

/** Primeiro e ultimo instante (em segundos corridos) das leituras exibidas. */
export interface AxisExtent {
  readonly min: number;
  readonly max: number;
}

/**
 * Eixo de horario. Com `extent`, vai da primeira a ultima leitura exibida com uma pequena folga; sem
 * leituras, cobre a janela do periodo. O periodo so define quais leituras sao buscadas.
 */
export function buildChartAxis(period: ReadingPeriodDto, extent?: AxisExtent | null): ChartAxis {
  let start = toEpochSeconds(period.start);
  let end = toEpochSeconds(period.end) + 1;
  if (extent != null) {
    const padding = Math.max((extent.max - extent.min) * PADDING_RATIO, MIN_PADDING);
    start = extent.min - padding;
    end = extent.max + padding;
  }
  const step = stepFor(end - start);
  const ticks: number[] = [];
  for (let tick = Math.ceil(start / step) * step; tick <= end; tick += step) {
    ticks.push(tick);
  }
  return {
    domain: [start, end],
    ticks,
    withDate: Math.floor(start / DAY_SECONDS) !== Math.floor((end - 1) / DAY_SECONDS),
  };
}
