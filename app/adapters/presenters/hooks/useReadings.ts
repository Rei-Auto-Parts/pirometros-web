import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../core/domain/constants/query-keys.constants';
import { REFRESH_INTERVAL_MS } from '../../../core/domain/constants/readings.constants';
import type { ReadingsPageDto } from '../../../core/domain/dtos/readings-page.dto';
import type { ListReadingsInput } from '../../../interfaces/core/application/i-list-readings.use-case';
import { useDependencies } from '../dependencies/AppDependencies';

/** Atualiza a cada 5 min sem mexer em filtro, periodo e pagina: a chave nao muda no refresh. */
export function useReadings(input: ListReadingsInput): UseQueryResult<ReadingsPageDto> {
  const { listReadingsUseCase } = useDependencies();
  return useQuery({
    queryKey: [...QUERY_KEYS.readings, input.period ?? 'hoje', input.pyrometerId, input.page],
    queryFn: () => listReadingsUseCase.execute(input),
    refetchInterval: REFRESH_INTERVAL_MS,
    placeholderData: keepPreviousData,
  });
}
