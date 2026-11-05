import type { IReadingsClient } from '../../interfaces/adapters/clients/i-readings.client';
import type { IGetReadingsSeriesUseCase } from '../../interfaces/core/application/i-get-readings-series.use-case';
import {
  DEFAULT_CHART_PERIOD,
  type ChartPeriodKey,
} from '../domain/constants/chart-periods.constants';
import type { PyrometerSeriesDto } from '../domain/dtos/pyrometer-series.dto';
import { getChartPeriod } from '../domain/models/chart-period.model';

export class GetReadingsSeriesUseCase implements IGetReadingsSeriesUseCase {
  constructor(private readonly readingsClient: IReadingsClient) {}

  async execute(
    pyrometerId: string | null,
    period: ChartPeriodKey = DEFAULT_CHART_PERIOD,
  ): Promise<PyrometerSeriesDto[]> {
    return this.readingsClient.getSeries(getChartPeriod(period), pyrometerId);
  }
}
