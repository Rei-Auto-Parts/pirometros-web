import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IGetHealthUseCase } from '../../../../interfaces/core/application/i-get-health.use-case';
import { WebEntry } from '../../../../infra/web/web-entry';
import { buildDependencies } from '../../adapters/presenters/test-render';

function run(path: string): void {
  window.history.pushState({}, '', path);
  const useCase: IGetHealthUseCase = { execute: vi.fn<IGetHealthUseCase['execute']>() };
  vi.spyOn(useCase, 'execute').mockResolvedValue({ api: 'up', database: 'up' });
  const container = document.createElement('div');
  document.body.appendChild(container);
  new WebEntry(
    buildDependencies({
      getHealthUseCase: useCase,
      getReadingsSeriesUseCase: { execute: vi.fn().mockResolvedValue([]) },
      listReadingsUseCase: {
        execute: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 50 }),
      },
      listPyrometersUseCase: { execute: vi.fn().mockResolvedValue([]) },
      listPyrometerSummariesUseCase: { execute: vi.fn().mockResolvedValue([]) },
    }),
  ).run(container);
}

describe('WebEntry', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    window.history.pushState({}, '', '/');
  });

  it('deve abrir o Acompanhamento com o menu lateral quando a rota for a raiz', async () => {
    // Arrange
    // Act
    run('/');

    // Assert
    expect(await screen.findByRole('complementary', { name: 'Menu lateral' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Acompanhamento' })).toBeInTheDocument();
  });

  it('deve abrir as Leituras quando a rota for /leituras', async () => {
    // Arrange
    // Act
    run('/leituras');

    // Assert
    expect(await screen.findByRole('heading', { name: 'Leituras' })).toBeInTheDocument();
  });

  it('deve abrir a Saúde do sistema quando a rota for /saude', async () => {
    // Arrange
    // Act
    run('/saude');

    // Assert
    expect(await screen.findAllByText('No ar')).toHaveLength(2);
  });

  it('deve abrir os Pirômetros quando a rota for /pirometros', async () => {
    // Arrange
    // Act
    run('/pirometros');

    // Assert
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Pirômetros' }),
    ).toBeInTheDocument();
  });
});
