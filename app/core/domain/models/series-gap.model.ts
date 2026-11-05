import { SERIES_GAP_SECONDS } from '../constants/readings.constants';
import type { SeriesPointDto } from '../dtos/pyrometer-series.dto';
import { toEpochSeconds } from './reg-date.model';

export interface ChartPoint {
  readonly x: number;
  /** `null` marca a lacuna: o grafico nao liga os pontos vizinhos. */
  readonly temperature: number | null;
}

/** Pontos do grafico, com um ponto vazio entre duas leituras separadas por mais que `gapSeconds`. */
export function toChartPoints(
  points: readonly SeriesPointDto[],
  gapSeconds: number = SERIES_GAP_SECONDS,
): ChartPoint[] {
  const result: ChartPoint[] = [];
  for (const point of points) {
    const x = toEpochSeconds(point.measuredAt);
    const previous = result.at(-1);
    if (previous !== undefined && x - previous.x > gapSeconds) {
      result.push({ x: Math.floor((previous.x + x) / 2), temperature: null });
    }
    result.push({ x, temperature: point.temperature });
  }
  return result;
}
