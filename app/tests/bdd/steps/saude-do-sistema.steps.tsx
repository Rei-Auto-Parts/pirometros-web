import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { HealthClient } from '../../../adapters/clients/health.client';
import { AppDependenciesProvider } from '../../../adapters/presenters/dependencies/AppDependencies';
import { AppLayout } from '../../../adapters/presenters/layout/AppLayout';
import { HomePage } from '../../../adapters/presenters/pages/HomePage';
import { GetHealthUseCase } from '../../../core/application/get-health.use-case';

interface Contexto {
  fetcher?: typeof fetch;
}

function json(body: object): typeof fetch {
  return async () => new Response(JSON.stringify(body), { status: 200 });
}

Given(
  'que a API informa API {string} e banco {string}',
  function (this: Contexto, api: string, database: string) {
    this.fetcher = json({ api, database });
  },
);

Given('que a API esta indisponivel', function (this: Contexto) {
  this.fetcher = async () => {
    throw new TypeError('Failed to fetch');
  };
});

When('eu abro a pagina inicial', function (this: Contexto) {
  assert.ok(this.fetcher, 'defina o comportamento da API antes de abrir a pagina');
  const useCase = new GetHealthUseCase(new HealthClient('/api', this.fetcher));
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter([
    { path: '/', element: <AppLayout />, children: [{ index: true, element: <HomePage /> }] },
  ]);
  render(
    <AppDependenciesProvider dependencies={{ getHealthUseCase: useCase }}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AppDependenciesProvider>,
  );
});

Then('vejo {string} como {string}', async function (servico: string, estado: string) {
  await waitFor(() => {
    const row = screen.getByText(servico).closest('li');
    assert.ok(row, `linha de '${servico}' nao encontrada`);
    within(row).getByText(estado);
  });
});

Then('vejo o menu lateral sem itens', function () {
  const sidebar = screen.getByRole('complementary', { name: 'Menu lateral' });
  assert.equal(within(sidebar).queryAllByRole('listitem').length, 0);
});
