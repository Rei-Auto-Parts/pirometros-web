import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppDependenciesProvider } from '../../../../../adapters/presenters/dependencies/AppDependencies';
import { useReadingsSeries } from '../../../../../adapters/presenters/hooks/useReadingsSeries';
import { REFRESH_INTERVAL_MS } from '../../../../../core/domain/constants/readings.constants';
import type { PyrometerSeriesDto } from '../../../../../core/domain/dtos/pyrometer-series.dto';
import { ReadingsUnavailableError } from '../../../../../core/domain/errors/readings-unavailable.error';
import type { IGetReadingsSeriesUseCase } from '../../../../../interfaces/core/application/i-get-readings-series.use-case';
import { buildDependencies } from '../test-render';

function buildSeries(pyrometerId: string | null, temperature: number): PyrometerSeriesDto[] {
  return [
    {
      pyrometerId,
      pyrometerName: 'Forno 1',
      points: [{ measuredAt: '2026-11-04T08:00:00', temperature }],
    },
  ];
}

function buildWrapper(useCase: IGetReadingsSeriesUseCase) {
  const dependencies = buildDependencies({ getReadingsSeriesUseCase: useCase });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AppDependenciesProvider dependencies={dependencies}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AppDependenciesProvider>
    );
  };
}

function buildUseCase() {
  const execute = vi.fn<IGetReadingsSeriesUseCase['execute']>();
  const useCase: IGetReadingsSeriesUseCase = { execute: () => Promise.resolve([]) };
  vi.spyOn(useCase, 'execute').mockImplementation(execute);
  return { useCase, execute };
}

describe('useReadingsSeries', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([[null], ['PIR-001']])(
    'deve devolver a serie do caso de uso quando o pirometro for %s',
    async (pyrometerId: string | null) => {
      // Arrange
      const { useCase, execute } = buildUseCase();
      const series = buildSeries(pyrometerId, 700);
      execute.mockResolvedValue(series);

      // Act
      const { result } = renderHook(() => useReadingsSeries(pyrometerId), {
        wrapper: buildWrapper(useCase),
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Assert
      expect(result.current.data).toEqual(series);
      expect(execute).toHaveBeenCalledTimes(1);
      expect(execute).toHaveBeenCalledWith(pyrometerId, 'today');
    },
  );

  it('deve consultar de novo com o mesmo pirometro quando passar o intervalo de atualizacao', async () => {
    // Arrange
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { useCase, execute } = buildUseCase();
    const nova = buildSeries('PIR-001', 750);
    const inicial = buildSeries('PIR-001', 700);
    execute.mockResolvedValueOnce(inicial).mockResolvedValue(nova);
    const { result } = renderHook(() => useReadingsSeries('PIR-001'), {
      wrapper: buildWrapper(useCase),
    });
    await waitFor(() => expect(result.current.data).toEqual(inicial));

    // Act
    await act(async () => {
      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS);
    });
    await waitFor(() => expect(result.current.data).toEqual(nova));

    // Assert
    expect(execute).toHaveBeenCalledTimes(2);
    expect(execute).toHaveBeenNthCalledWith(1, 'PIR-001', 'today');
    expect(execute).toHaveBeenNthCalledWith(2, 'PIR-001', 'today');
  });

  it('deve consultar o novo pirometro quando o pirometro for trocado no rerender', async () => {
    // Arrange
    const { useCase, execute } = buildUseCase();
    const segunda = buildSeries('PIR-002', 800);
    execute.mockResolvedValueOnce(buildSeries('PIR-001', 700)).mockResolvedValueOnce(segunda);
    const { result, rerender } = renderHook(
      ({ id }: { id: string | null }) => useReadingsSeries(id),
      { wrapper: buildWrapper(useCase), initialProps: { id: 'PIR-001' as string | null } },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    rerender({ id: 'PIR-002' });
    await waitFor(() => expect(result.current.data).toEqual(segunda));

    // Assert
    expect(execute).toHaveBeenCalledTimes(2);
    expect(execute).toHaveBeenNthCalledWith(1, 'PIR-001', 'today');
    expect(execute).toHaveBeenNthCalledWith(2, 'PIR-002', 'today');
  });

  it('deve sinalizar erro quando o caso de uso rejeitar com ReadingsUnavailableError', async () => {
    // Arrange
    const { useCase, execute } = buildUseCase();
    const error = new ReadingsUnavailableError('HTTP 503');
    execute.mockRejectedValue(error);

    // Act
    const { result } = renderHook(() => useReadingsSeries(null), {
      wrapper: buildWrapper(useCase),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(result.current.error).toBe(error);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith(null, 'today');
  });

  it('deve consultar o periodo escolhido quando ele e informado', async () => {
    // Arrange
    const { useCase, execute } = buildUseCase();
    execute.mockResolvedValue([]);

    // Act
    const { result } = renderHook(() => useReadingsSeries('PIR-001', 'sixHours'), {
      wrapper: buildWrapper(useCase),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith('PIR-001', 'sixHours');
  });

  it('deve consultar de novo quando o periodo for trocado no rerender', async () => {
    // Arrange
    const { useCase, execute } = buildUseCase();
    execute.mockResolvedValue([]);
    const { result, rerender } = renderHook(
      ({ period }: { period: 'today' | 'hour' }) => useReadingsSeries(null, period),
      { wrapper: buildWrapper(useCase), initialProps: { period: 'today' as 'today' | 'hour' } },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    rerender({ period: 'hour' });
    await waitFor(() => expect(execute).toHaveBeenCalledTimes(2));

    // Assert
    expect(execute).toHaveBeenNthCalledWith(2, null, 'hour');
  });
});
