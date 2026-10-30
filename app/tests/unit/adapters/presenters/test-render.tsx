import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import {
  type AppDependencies,
  AppDependenciesProvider,
} from '../../../../adapters/presenters/dependencies/AppDependencies';

export function renderWithApp(ui: ReactElement, dependencies: AppDependencies) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <AppDependenciesProvider dependencies={dependencies}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    </AppDependenciesProvider>,
  );
}
