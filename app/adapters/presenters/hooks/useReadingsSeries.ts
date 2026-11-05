import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  DEFAULT_CHART_PERIOD,
  type ChartPeriodKey,
} from '../../../core/domain/constants/chart-periods.constants';
import { QUERY_KEYS } from '../../../core/domain/constants/query-keys.constants';
import { REFRESH_INTERVAL_MS } from '../../../core/domain/constants/readings.constants';
import type { PyrometerSeriesDto } from '../../../core/domain/dtos/pyrometer-series.dto';
import { useDependencies } from '../dependencies/AppDependencies';

/** A chave leva o periodo (nao a janela): a janela relativa anda a cada atualizacao de 5 min. */
export function useReadingsSeries(
  pyrometerId: string | null,
  period: ChartPeriodKey = DEFAULT_CHART_PERIOD,
): UseQueryResult<PyrometerSeriesDto[]> {
  const { getReadingsSeriesUseCase } = useDependencies();
  return useQuery({
    queryKey: [...QUERY_KEYS.series, period, pyrometerId],
    queryFn: () => getReadingsSeriesUseCase.execute(pyrometerId, period),
    refetchInterval: REFRESH_INTERVAL_MS,
    placeholderData: keepPreviousData,
  });
}
