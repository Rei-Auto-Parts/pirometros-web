import type { ChartPeriodKey } from '../../../core/domain/constants/chart-periods.constants';
import type { PyrometerSeriesDto } from '../../../core/domain/dtos/pyrometer-series.dto';

export interface IGetReadingsSeriesUseCase {
  /** Serie do periodo (padrao: hoje), de todos os pirometros ou de um so. */
  execute(pyrometerId: string | null, period?: ChartPeriodKey): Promise<PyrometerSeriesDto[]>;
}
