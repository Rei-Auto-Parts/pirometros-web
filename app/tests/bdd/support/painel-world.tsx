import { mock } from 'node:test';
import { AfterAll, Before, setWorldConstructor } from '@cucumber/cucumber';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { HealthClient } from '../../../adapters/clients/health.client';
import { PyrometersClient } from '../../../adapters/clients/pyrometers.client';
import { ReadingsClient } from '../../../adapters/clients/readings.client';
import { AppDependenciesProvider } from '../../../adapters/presenters/dependencies/AppDependencies';
import { GetHealthUseCase } from '../../../core/application/get-health.use-case';
import { GetReadingsSeriesUseCase } from '../../../core/application/get-readings-series.use-case';
import { ListPyrometerSummariesUseCase } from '../../../core/application/list-pyrometer-summaries.use-case';
import { ListPyrometersUseCase } from '../../../core/application/list-pyrometers.use-case';
import { ListReadingsUseCase } from '../../../core/application/list-readings.use-case';
import { SavePyrometerProfileUseCase } from '../../../core/application/save-pyrometer-profile.use-case';
import { APP_ROUTES } from '../../../infra/web/app-routes';
import { FakeApi } from './fake-api';

/** `29/10/2026` -> `2026-10-29`. */
export function isoDay(dmy: string): string {
  const [d, m, y] = dmy.split('/');
  return `${y}-${m}-${d}`;
}

/** `29/10/2026 23:59` -> `2026-10-29T23:59` (valor de `datetime-local`). */
export function isoMinute(dmy: string, hm: string): string {
  return `${isoDay(dmy)}T${hm}`;
}

const realNow = Date.now();
let clockOn = false;

function startClock(now: number): void {
  if (clockOn) {
    mock.timers.setTime(now);
    return;
  }
  mock.timers.enable({ apis: ['Date', 'setInterval'], now });
  clockOn = true;
}

/** Antes de cada cenario: se o relogio falso ja esta ligado, volta para o horario real. */
export function resetClock(): void {
  if (clockOn) mock.timers.setTime(realNow);
}

export function stopClock(): void {
  mock.timers.reset();
  clockOn = false;
}

export class PainelWorld {
  api = new FakeApi();
  queryClient?: QueryClient;
  renders = 0;
  /** Guarda o que um passo `Quando` quer comparar no `Entao`. */
  memo: Record<string, unknown> = {};

  /**
   * Fixa "agora". O relogio falso do Node liga uma vez so (religar a cada cenario deixa o
   * `setInterval` mudo a partir do terceiro uso) e os demais cenarios voltam ao horario real.
   */
  setNow(iso: string): void {
    startClock(new Date(iso).getTime());
  }

  /** O Date falso so anda depois do timer disparar: avanca ate 1 ms antes e deixa o timer rodar ja no novo "agora". */
  advance(ms: number): void {
    mock.timers.tick(ms - 1);
    mock.timers.tick(1);
  }

  open(route: string): void {
    this.renders += 1;
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    this.queryClient = queryClient;
    const router = createMemoryRouter(APP_ROUTES, { initialEntries: [route] });
    const { fetcher } = this.api;
    const pyrometersClient = new PyrometersClient('/api', fetcher);
    render(
      <AppDependenciesProvider
        dependencies={{
          getHealthUseCase: new GetHealthUseCase(new HealthClient('/api', fetcher)),
          listReadingsUseCase: new ListReadingsUseCase(new ReadingsClient('/api', fetcher)),
          getReadingsSeriesUseCase: new GetReadingsSeriesUseCase(
            new ReadingsClient('/api', fetcher),
          ),
          listPyrometersUseCase: new ListPyrometersUseCase(pyrometersClient),
          listPyrometerSummariesUseCase: new ListPyrometerSummariesUseCase(pyrometersClient),
          savePyrometerProfileUseCase: new SavePyrometerProfileUseCase(pyrometersClient),
        }}
      >
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AppDependenciesProvider>,
    );
  }

  /** Abre a rota so se ainda nao ha tela aberta (os `Quando` nao repetem o `Dado`). */
  ensureOpen(route: string): void {
    if (this.renders === 0) this.open(route);
  }

  /** Espera sem depender de `setTimeout`/`setInterval`, que o relogio falso pode ter trocado. */
  async eventually(check: () => void, attempts = 200): Promise<void> {
    let last: unknown;
    for (let i = 0; i < attempts; i += 1) {
      try {
        check();
        return;
      } catch (error) {
        last = error;
        await act(async () => {
          await new Promise<void>((resolve) => setImmediate(resolve));
        });
      }
    }
    throw last;
  }

  async settle(): Promise<void> {
    await act(async () => {
      for (let i = 0; i < 20; i += 1) await new Promise<void>((resolve) => setImmediate(resolve));
    });
  }

  heading(): string {
    return screen.getByRole('heading', { level: 1 }).textContent ?? '';
  }
}

setWorldConstructor(PainelWorld);

Before(resetClock);
AfterAll(stopClock);
