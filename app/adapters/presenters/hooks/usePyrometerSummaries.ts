import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../core/domain/constants/query-keys.constants';
import { REFRESH_INTERVAL_MS } from '../../../core/domain/constants/readings.constants';
import type { PyrometerSummaryDto } from '../../../core/domain/dtos/pyrometer-summary.dto';
import { useDependencies } from '../dependencies/AppDependencies';

export function usePyrometerSummaries(): UseQueryResult<PyrometerSummaryDto[]> {
  const { listPyrometerSummariesUseCase } = useDependencies();
  return useQuery({
    queryKey: QUERY_KEYS.summaries,
    queryFn: () => listPyrometerSummariesUseCase.execute(),
    refetchInterval: REFRESH_INTERVAL_MS,
  });
}
