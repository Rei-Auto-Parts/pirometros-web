import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AppDependenciesProvider } from '../../../../../adapters/presenters/dependencies/AppDependencies';
import { usePyrometers } from '../../../../../adapters/presenters/hooks/usePyrometers';
import type { PyrometerDto } from '../../../../../core/domain/dtos/pyrometer.dto';
import { ReadingsUnavailableError } from '../../../../../core/domain/errors/readings-unavailable.error';
import type { IListPyrometersUseCase } from '../../../../../interfaces/core/application/i-list-pyrometers.use-case';
import { buildDependencies } from '../test-render';

function useCaseStub(): IListPyrometersUseCase {
  return { execute: vi.fn<IListPyrometersUseCase['execute']>() };
}

function wrapperFor(
  useCase: IListPyrometersUseCase,
): ({ children }: { children: ReactNode }) => ReactNode {
  const dependencies = buildDependencies({ listPyrometersUseCase: useCase });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }) => (
    <AppDependenciesProvider dependencies={dependencies}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AppDependenciesProvider>
  );
}

describe('usePyrometers', () => {
  it('deve devolver a lista do caso de uso quando ele resolve', async () => {
    // Arrange
    const useCase = useCaseStub();
    const pyrometers: PyrometerDto[] = [
      { id: 'p1', name: 'Forno 1', nickname: null, color: '#2563eb', note: null, active: true },
      { id: 'p2', name: null, nickname: null, color: '#dc2626', note: null, active: true },
    ];
    const spy = vi.spyOn(useCase, 'execute').mockResolvedValue(pyrometers);

    // Act
    const { result } = renderHook(() => usePyrometers(), { wrapper: wrapperFor(useCase) });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(result.current.data).toEqual(pyrometers);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith();
  });

  it('deve expor isError quando o caso de uso rejeita com ReadingsUnavailableError', async () => {
    // Arrange
    const useCase = useCaseStub();
    const error = new ReadingsUnavailableError('timeout');
    const spy = vi.spyOn(useCase, 'execute').mockRejectedValue(error);

    // Act
    const { result } = renderHook(() => usePyrometers(), { wrapper: wrapperFor(useCase) });
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(result.current.error).toBe(error);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith();
  });
});
