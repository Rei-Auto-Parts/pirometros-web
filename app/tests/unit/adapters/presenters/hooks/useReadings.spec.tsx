import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppDependenciesProvider } from '../../../../../adapters/presenters/dependencies/AppDependencies';
import { useReadings } from '../../../../../adapters/presenters/hooks/useReadings';
import { REFRESH_INTERVAL_MS } from '../../../../../core/domain/constants/readings.constants';
import type { ReadingsPageDto } from '../../../../../core/domain/dtos/readings-page.dto';
import { ReadingsUnavailableError } from '../../../../../core/domain/errors/readings-unavailable.error';
import type {
  IListReadingsUseCase,
  ListReadingsInput,
} from '../../../../../interfaces/core/application/i-list-readings.use-case';
import { buildDependencies } from '../test-render';

function buildPage(page: number, total: number): ReadingsPageDto {
  return { items: [], total, page, pageSize: 50 };
}

const INPUT: ListReadingsInput = {
  period: { start: '2026-11-01T00:00', end: '2026-11-02T23:59' },
  pyrometerId: 'pir-1',
  page: 1,
};

describe('useReadings', () => {
  let execute: ReturnType<typeof vi.fn<IListReadingsUseCase['execute']>>;
  let wrapper: (props: { children: ReactNode }) => ReactNode;

  beforeEach(() => {
    const useCase: IListReadingsUseCase = { execute: vi.fn() };
    execute = vi.fn<IListReadingsUseCase['execute']>();
    vi.spyOn(useCase, 'execute').mockImplementation(execute);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const dependencies = buildDependencies({ listReadingsUseCase: useCase });
    wrapper = ({ children }) => (
      <AppDependenciesProvider dependencies={dependencies}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AppDependenciesProvider>
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('deve devolver a pagina do caso de uso quando o hook e montado com um input', async () => {
    // Arrange
    const page = buildPage(1, 10);
    execute.mockResolvedValue(page);

    // Act
    const { result } = renderHook(() => useReadings(INPUT), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(result.current.data).toEqual(page);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith(INPUT);
  });

  it('deve consultar de novo com o mesmo input quando o intervalo de atualizacao passa', async () => {
    // Arrange
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const first = buildPage(1, 10);
    const second = buildPage(1, 11);
    execute.mockResolvedValueOnce(first).mockResolvedValueOnce(second);
    const { result } = renderHook(() => useReadings(INPUT), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(first));

    // Act
    await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS);
    await waitFor(() => expect(result.current.data).toEqual(second));

    // Assert
    expect(execute).toHaveBeenCalledTimes(2);
    expect(execute).toHaveBeenNthCalledWith(1, INPUT);
    expect(execute).toHaveBeenNthCalledWith(2, INPUT);
  });

  it('deve consultar a pagina nova quando a pagina muda no rerender', async () => {
    // Arrange
    const pageOne = buildPage(1, 120);
    const pageTwo = buildPage(2, 120);
    execute.mockResolvedValueOnce(pageOne).mockResolvedValueOnce(pageTwo);
    const { result, rerender } = renderHook(({ input }) => useReadings(input), {
      wrapper,
      initialProps: { input: INPUT },
    });
    await waitFor(() => expect(result.current.data).toEqual(pageOne));

    // Act
    rerender({ input: { ...INPUT, page: 2 } });
    await waitFor(() => expect(result.current.data).toEqual(pageTwo));

    // Assert
    expect(execute).toHaveBeenCalledTimes(2);
    expect(execute).toHaveBeenNthCalledWith(2, { ...INPUT, page: 2 });
  });

  it('deve sinalizar erro quando o caso de uso rejeita com ReadingsUnavailableError', async () => {
    // Arrange
    const error = new ReadingsUnavailableError('api fora do ar');
    execute.mockRejectedValue(error);

    // Act
    const { result } = renderHook(() => useReadings(INPUT), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(result.current.error).toBe(error);
    expect(execute).toHaveBeenCalledTimes(1);
  });
});
