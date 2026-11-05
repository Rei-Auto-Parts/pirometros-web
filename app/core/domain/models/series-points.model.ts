import type { SeriesPointDto } from '../dtos/pyrometer-series.dto';
import { toEpochSeconds } from './reg-date.model';

export interface ChartPoint {
  readonly x: number;
  readonly temperature: number;
}

/** Um ponto do grafico por leitura, na ordem recebida; o grafico liga todos, sem quebra por intervalo. */
export function toChartPoints(points: readonly SeriesPointDto[]): ChartPoint[] {
  return points.map((point) => ({
    x: toEpochSeconds(point.measuredAt),
    temperature: point.temperature,
  }));
}
