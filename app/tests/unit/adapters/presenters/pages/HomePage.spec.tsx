import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomePage } from '../../../../../adapters/presenters/pages/HomePage';
import type { HealthStatusDto } from '../../../../../core/domain/dtos/health-status.dto';
import type { IGetHealthUseCase } from '../../../../../interfaces/core/application/i-get-health.use-case';
import { renderWithApp } from '../test-render';

function useCaseStub(): IGetHealthUseCase {
  return { execute: vi.fn<IGetHealthUseCase['execute']>() };
}

describe('HomePage', () => {
  it('deve mostrar API e banco no ar quando o caso de uso informa up', async () => {
    // Arrange
    const useCase = useCaseStub();
    const status: HealthStatusDto = { api: 'up', database: 'up' };
    vi.spyOn(useCase, 'execute').mockResolvedValue(status);

    // Act
    renderWithApp(<HomePage />, { getHealthUseCase: useCase });

    // Assert
    expect(await screen.findAllByText('No ar')).toHaveLength(2);
    expect(useCase.execute).toHaveBeenCalledTimes(1);
    expect(useCase.execute).toHaveBeenCalledWith();
  });

  it('deve mostrar o banco fora do ar quando a API informa down', async () => {
    // Arrange
    const useCase = useCaseStub();
    vi.spyOn(useCase, 'execute').mockResolvedValue({ api: 'up', database: 'down' });

    // Act
    renderWithApp(<HomePage />, { getHealthUseCase: useCase });

    // Assert
    expect(await screen.findByText('Fora do ar')).toBeInTheDocument();
    expect(screen.getByText('No ar')).toBeInTheDocument();
  });

  it('deve mostrar API fora do ar e banco indeterminado quando a API esta indisponivel', async () => {
    // Arrange
    const useCase = useCaseStub();
    vi.spyOn(useCase, 'execute').mockResolvedValue({ api: 'down', database: 'unknown' });

    // Act
    renderWithApp(<HomePage />, { getHealthUseCase: useCase });

    // Assert
    expect(await screen.findByText('Fora do ar')).toBeInTheDocument();
    expect(screen.getByText('Indeterminado')).toBeInTheDocument();
  });

  it('deve mostrar verificando enquanto a consulta nao termina', () => {
    // Arrange
    const useCase = useCaseStub();
    vi.spyOn(useCase, 'execute').mockReturnValue(new Promise(() => undefined));

    // Act
    renderWithApp(<HomePage />, { getHealthUseCase: useCase });

    // Assert
    expect(screen.getAllByText('Verificando…')).toHaveLength(2);
  });

  it('deve titular a pagina em portugues com cabecalhos acessiveis', () => {
    // Arrange
    const useCase = useCaseStub();
    vi.spyOn(useCase, 'execute').mockReturnValue(new Promise(() => undefined));

    // Act
    renderWithApp(<HomePage />, { getHealthUseCase: useCase });

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Início' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Status do sistema' }),
    ).toBeInTheDocument();
  });
});
