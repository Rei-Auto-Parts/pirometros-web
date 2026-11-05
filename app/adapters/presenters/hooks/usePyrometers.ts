import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../core/domain/constants/query-keys.constants';
import type { PyrometerDto } from '../../../core/domain/dtos/pyrometer.dto';
import { useDependencies } from '../dependencies/AppDependencies';

export function usePyrometers(): UseQueryResult<PyrometerDto[]> {
  const { listPyrometersUseCase } = useDependencies();
  return useQuery({
    queryKey: QUERY_KEYS.pyrometers,
    queryFn: () => listPyrometersUseCase.execute(),
  });
}
