import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../core/domain/constants/query-keys.constants';
import type { PyrometerDto } from '../../../core/domain/dtos/pyrometer.dto';
import type { PyrometerProfileDto } from '../../../core/domain/dtos/pyrometer-profile.dto';
import { useDependencies } from '../dependencies/AppDependencies';

/** Grava o complemento de um pirometro; ao salvar, a lista de pirometros e atualizada em todas as telas. */
export function useSavePyrometer(
  pyrometerId: string,
): UseMutationResult<PyrometerDto, Error, PyrometerProfileDto> {
  const { savePyrometerProfileUseCase } = useDependencies();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profile: PyrometerProfileDto) =>
      savePyrometerProfileUseCase.execute(pyrometerId, profile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pyrometers }),
  });
}
