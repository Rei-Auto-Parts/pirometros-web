import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import {
  type AppDependencies,
  AppDependenciesProvider,
} from '../../adapters/presenters/dependencies/AppDependencies';
import '../../adapters/presenters/styles/globals.css';
import { APP_ROUTES } from './app-routes';

export class WebEntry {
  constructor(private readonly dependencies: AppDependencies) {}

  run(container: HTMLElement): void {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const router = createBrowserRouter(APP_ROUTES);
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
