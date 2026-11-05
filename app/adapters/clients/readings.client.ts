import type { PyrometerSeriesDto } from '../../core/domain/dtos/pyrometer-series.dto';
import type { ReadingPeriodDto } from '../../core/domain/dtos/reading-period.dto';
import type { ReadingsPageDto } from '../../core/domain/dtos/readings-page.dto';
import type {
  IReadingsClient,
  ListReadingsQuery,
} from '../../interfaces/adapters/clients/i-readings.client';
import type { components } from './api-schema';
import { fetchJson } from './fetch-json';

type ReadingsPageResponse = components['schemas']['ReadingsPageResponse'];
type PyrometerSeriesResponse = components['schemas']['PyrometerSeriesResponse'];

/** Toda chamada de rede do projeto mora em `adapters/clients/`, nunca dentro de componente. */
export class ReadingsClient implements IReadingsClient {
  constructor(
    private readonly baseUrl: string = '/api',
    private readonly fetcher: typeof fetch = (...args) => fetch(...args),
  ) {}

  async listReadings(query: ListReadingsQuery): Promise<ReadingsPageDto> {
    const params = this.params(query.period, query.pyrometerId);
    params.set('page', String(query.page));
    params.set('page_size', String(query.pageSize));
    const body = await fetchJson<ReadingsPageResponse>(
      this.fetcher,
      `${this.baseUrl}/readings?${params.toString()}`,
    );
    return {
      items: body.items.map((item) => ({
        id: item.id,
        measuredAt: item.measured_at ?? null,
        pyrometerId: item.pyrometer_id ?? null,
        pyrometerName: item.pyrometer_name ?? null,
        temperature: item.temperature ?? null,
        unit: item.unit ?? null,
        battery: item.battery ?? null,
        place: item.place ?? null,
      })),
      total: body.total,
      page: body.page,
      pageSize: body.page_size,
    };
  }

  async getSeries(
    period: ReadingPeriodDto,
    pyrometerId: string | null,
  ): Promise<PyrometerSeriesDto[]> {
    const params = this.params(period, pyrometerId);
    const body = await fetchJson<PyrometerSeriesResponse[]>(
      this.fetcher,
      `${this.baseUrl}/readings/series?${params.toString()}`,
    );
    return body.map((series) => ({
      pyrometerId: series.pyrometer_id ?? null,
      pyrometerName: series.pyrometer_name ?? null,
      points: series.points.flatMap((point) =>
        point.measured_at != null && point.temperature != null
          ? [{ measuredAt: point.measured_at, temperature: point.temperature }]
          : [],
      ),
    }));
  }

  private params(period: ReadingPeriodDto, pyrometerId: string | null): URLSearchParams {
    const params = new URLSearchParams({ start: period.start, end: period.end });
    if (pyrometerId !== null) {
      params.set('dev_id', pyrometerId);
    }
    return params;
  }
}
