import 'global-jsdom/register';
import { After, AfterAll } from '@cucumber/cucumber';
import type { QueryClient } from '@tanstack/react-query';
import { cleanup } from '@testing-library/react';

/** Timers que a biblioteca de consultas e o React deixam armados; sem isso o processo nao encerra. */
const armed = new Set<NodeJS.Timeout>();
const realSetTimeout = globalThis.setTimeout;
globalThis.setTimeout = ((...args: Parameters<typeof setTimeout>) => {
  const handle = realSetTimeout(...args);
  armed.add(handle);
  return handle;
}) as typeof setTimeout;

/** Solta o que o cenario deixou: tela, cache de consultas (timers de refresh), e tema. */
After(function (this: { queryClient?: QueryClient }) {
  cleanup();
  this.queryClient?.clear();
  document.documentElement.classList.remove('dark');
});

AfterAll(() => {
  for (const handle of armed) handle.unref();
});
