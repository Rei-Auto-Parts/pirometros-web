import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../core/domain/constants/query-keys.constants';
import type { HealthStatusDto } from '../../../core/domain/dtos/health-status.dto';
import { useDependencies } from '../dependencies/AppDependencies';

const REFRESH_INTERVAL_MS = 30_000;

/** Adaptador entre a UI e o caso de uso: o componente nao conhece client nem `fetch`. */
export function useHealth(): UseQueryResult<HealthStatusDto> {
  const { getHealthUseCase } = useDependencies();
  return useQuery({
    queryKey: QUERY_KEYS.health,
    queryFn: () => getHealthUseCase.execute(),
    refetchInterval: REFRESH_INTERVAL_MS,
  });
}
