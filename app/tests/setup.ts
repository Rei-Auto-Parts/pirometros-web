import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  // O armazenamento do jsdom dura o arquivo todo: a escolha de tema de um teste nao pode vazar.
  if (typeof localStorage !== 'undefined') localStorage.clear();
});
