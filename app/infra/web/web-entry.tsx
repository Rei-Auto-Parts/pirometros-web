import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import {
  type AppDependencies,
  AppDependenciesProvider,
} from '../../adapters/presenters/dependencies/AppDependencies';
import { AppLayout } from '../../adapters/presenters/layout/AppLayout';
import { HomePage } from '../../adapters/presenters/pages/HomePage';
import '../../adapters/presenters/styles/globals.css';
import { ROUTES } from '../../core/domain/constants/routes.constants';

export class WebEntry {
  constructor(private readonly dependencies: AppDependencies) {}

  run(container: HTMLElement): void {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const router = createBrowserRouter([
      {
        path: ROUTES.home,
        element: <AppLayout />,
        children: [{ index: true, element: <HomePage /> }],
      },
    ]);
    createRoot(container).render(
      <StrictMode>
        <AppDependenciesProvider dependencies={this.dependencies}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </AppDependenciesProvider>
      </StrictMode>,
    );
  }
}
