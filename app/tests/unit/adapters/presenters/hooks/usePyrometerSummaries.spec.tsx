import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AppDependenciesProvider } from '../../../../../adapters/presenters/dependencies/AppDependencies';
import { usePyrometerSummaries } from '../../../../../adapters/presenters/hooks/usePyrometerSummaries';
import { REFRESH_INTERVAL_MS } from '../../../../../core/domain/constants/readings.constants';
import type { PyrometerSummaryDto } from '../../../../../core/domain/dtos/pyrometer-summary.dto';
import { ReadingsUnavailableError } from '../../../../../core/domain/errors/readings-unavailable.error';
import type { IListPyrometerSummariesUseCase } from '../../../../../interfaces/core/application/i-list-pyrometer-summaries.use-case';
import { buildDependencies } from '../test-render';

const SUMMARY: PyrometerSummaryDto = {
  pyrometerId: 'SN-1',
  temperature: 1510,
  measuredAt: '2026-11-05T10:05:00',
  battery: 62,
  minutesWithoutReading: 3,
};

function useCaseStub(): IListPyrometerSummariesUseCase {
  return { execute: vi.fn<IListPyrometerSummariesUseCase['execute']>() };
}

function wrapperFor(
  useCase: IListPyrometerSummariesUseCase,
): ({ children }: { children: ReactNode }) => ReactNode {
  const dependencies = buildDependencies({ listPyrometerSummariesUseCase: useCase });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }) => (
    <AppDependenciesProvider dependencies={dependencies}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AppDependenciesProvider>
  );
}

describe('usePyrometerSummaries', () => {
  it('deve devolver o resumo do caso de uso quando ele resolve', async () => {
    // Arrange
    const useCase = useCaseStub();
    const spy = vi.spyOn(useCase, 'execute').mockResolvedValue([SUMMARY]);

    // Act
    const { result } = renderHook(() => usePyrometerSummaries(), { wrapper: wrapperFor(useCase) });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(result.current.data).toEqual([SUMMARY]);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith();
  });

  it('deve expor isError quando o caso de uso rejeita com ReadingsUnavailableError', async () => {
    // Arrange
    const useCase = useCaseStub();
    const error = new ReadingsUnavailableError('timeout');
    const spy = vi.spyOn(useCase, 'execute').mockRejectedValue(error);

    // Act
    const { result } = renderHook(() => usePyrometerSummaries(), { wrapper: wrapperFor(useCase) });
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(result.current.error).toBe(error);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('deve consultar de novo quando passam 5 minutos', async () => {
    // Arrange
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const useCase = useCaseStub();
    const spy = vi.spyOn(useCase, 'execute').mockResolvedValue([SUMMARY]);
    const { result } = renderHook(() => usePyrometerSummaries(), { wrapper: wrapperFor(useCase) });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    await act(async () => {
      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS);
    });

    // Assert
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(2));
    vi.useRealTimers();
  });
});
