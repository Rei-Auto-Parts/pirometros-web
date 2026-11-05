import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AppDependenciesProvider } from '../../../../../adapters/presenters/dependencies/AppDependencies';
import { useSavePyrometer } from '../../../../../adapters/presenters/hooks/useSavePyrometer';
import { QUERY_KEYS } from '../../../../../core/domain/constants/query-keys.constants';
import type { PyrometerDto } from '../../../../../core/domain/dtos/pyrometer.dto';
import type { PyrometerProfileDto } from '../../../../../core/domain/dtos/pyrometer-profile.dto';
import { ProfileRejectedError } from '../../../../../core/domain/errors/profile-rejected.error';
import type { ISavePyrometerProfileUseCase } from '../../../../../interfaces/core/application/i-save-pyrometer-profile.use-case';
import { buildDependencies } from '../test-render';

const PROFILE: PyrometerProfileDto = { nickname: 'Forno 2', color: null, note: null, active: true };
const SAVED: PyrometerDto = {
  id: 'SN-1',
  name: 'PI-12',
  nickname: 'Forno 2',
  color: '#2563eb',
  note: null,
  active: true,
};

function setup() {
  const useCase: ISavePyrometerProfileUseCase = {
    execute: vi.fn<ISavePyrometerProfileUseCase['execute']>(),
  };
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const dependencies = buildDependencies({ savePyrometerProfileUseCase: useCase });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AppDependenciesProvider dependencies={dependencies}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AppDependenciesProvider>
  );
  return { useCase, queryClient, wrapper };
}

describe('useSavePyrometer', () => {
  it('deve chamar o caso de uso com o serial e o complemento quando salva', async () => {
    // Arrange
    const { useCase, wrapper } = setup();
    const spy = vi.spyOn(useCase, 'execute').mockResolvedValue(SAVED);
    const { result } = renderHook(() => useSavePyrometer('SN-1'), { wrapper });

    // Act
    await act(async () => {
      await result.current.mutateAsync(PROFILE);
    });

    // Assert
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('SN-1', PROFILE);
  });

  it('deve invalidar a lista de pirometros quando salva com sucesso', async () => {
    // Arrange
    const { useCase, queryClient, wrapper } = setup();
    vi.spyOn(useCase, 'execute').mockResolvedValue(SAVED);
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSavePyrometer('SN-1'), { wrapper });

    // Act
    await act(async () => {
      await result.current.mutateAsync(PROFILE);
    });

    // Assert
    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.pyrometers });
  });

  it('deve expor o erro e nao invalidar a lista quando a API recusa', async () => {
    // Arrange
    const { useCase, queryClient, wrapper } = setup();
    const error = new ProfileRejectedError(422);
    vi.spyOn(useCase, 'execute').mockRejectedValue(error);
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSavePyrometer('SN-1'), { wrapper });

    // Act
    await act(async () => {
      result.current.mutate(PROFILE);
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(result.current.error).toBe(error);
    expect(invalidate).not.toHaveBeenCalled();
  });
});
