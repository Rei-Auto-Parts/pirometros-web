import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { IGetHealthUseCase } from '../../../../interfaces/core/application/i-get-health.use-case';
import { WebEntry } from '../../../../infra/web/web-entry';

describe('WebEntry', () => {
  it('deve renderizar a pagina inicial com o menu lateral quando executa no container', async () => {
    // Arrange
    const useCase: IGetHealthUseCase = { execute: vi.fn<IGetHealthUseCase['execute']>() };
    vi.spyOn(useCase, 'execute').mockResolvedValue({ api: 'up', database: 'up' });
    const container = document.createElement('div');
    document.body.appendChild(container);

    // Act
    new WebEntry({ getHealthUseCase: useCase }).run(container);

    // Assert
    expect(await screen.findByRole('complementary', { name: 'Menu lateral' })).toBeInTheDocument();
    expect(await screen.findAllByText('No ar')).toHaveLength(2);
  });
});
