import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import {
  type AppDependencies,
  AppDependenciesProvider,
} from '../../../../adapters/presenters/dependencies/AppDependencies';

/** Completa as dependencias que o teste nao usa com casos de uso que nunca devem ser chamados. */
export function buildDependencies(overrides: Partial<AppDependencies>): AppDependencies {
  return {
    getHealthUseCase: { execute: vi.fn() },
    listReadingsUseCase: { execute: vi.fn() },
    getReadingsSeriesUseCase: { execute: vi.fn() },
    listPyrometersUseCase: { execute: vi.fn() },
    listPyrometerSummariesUseCase: { execute: vi.fn() },
    savePyrometerProfileUseCase: { execute: vi.fn() },
    ...overrides,
  };
}

export function renderWithApp(ui: ReactElement, overrides: Partial<AppDependencies>) {
  const dependencies = buildDependencies(overrides);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <AppDependenciesProvider dependencies={dependencies}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    </AppDependenciesProvider>,
  );
}
