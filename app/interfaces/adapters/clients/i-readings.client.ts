import type { ReadingPeriodDto } from '../../../core/domain/dtos/reading-period.dto';
import type { PyrometerSeriesDto } from '../../../core/domain/dtos/pyrometer-series.dto';
import type { ReadingsPageDto } from '../../../core/domain/dtos/readings-page.dto';

export interface ListReadingsQuery {
  readonly period: ReadingPeriodDto;
  readonly pyrometerId: string | null;
  readonly page: number;
  readonly pageSize: number;
}

export interface IReadingsClient {
  /** `GET /api/readings`. Lanca `ReadingsUnavailableError` se a API nao responder. */
  listReadings(query: ListReadingsQuery): Promise<ReadingsPageDto>;
  /** `GET /api/readings/series`. Lanca `ReadingsUnavailableError` se a API nao responder. */
  getSeries(period: ReadingPeriodDto, pyrometerId: string | null): Promise<PyrometerSeriesDto[]>;
}
