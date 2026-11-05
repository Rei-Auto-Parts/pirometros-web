import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';

import { ReadingsPage } from '../../../../../adapters/presenters/pages/ReadingsPage';
import type { PyrometerDto } from '../../../../../core/domain/dtos/pyrometer.dto';
import type { ReadingsPageDto } from '../../../../../core/domain/dtos/readings-page.dto';
import { ReadingsUnavailableError } from '../../../../../core/domain/errors/readings-unavailable.error';
import type { ListReadingsInput } from '../../../../../interfaces/core/application/i-list-readings.use-case';
import { renderWithApp } from '../test-render';

type ListExecute = (input: ListReadingsInput) => Promise<ReadingsPageDto>;

function pageOf(total: number, page = 1): ReadingsPageDto {
  return {
    items:
      total === 0
        ? []
        : [
            {
              id: 1,
              measuredAt: '2026-05-01T08:00:00',
              pyrometerId: 'SN-001',
              pyrometerName: 'Forno 1',
              temperature: 700,
              unit: 'C',
              battery: null,
              place: null,
            },
          ],
    total,
    page,
    pageSize: 50,
  };
}

const PYROMETERS: PyrometerDto[] = [
  { id: 'SN-001', name: 'Forno 1', nickname: null, color: '#2563eb', note: null, active: true },
];

function renderPage(execute: Mock<ListExecute>, pyrometers: PyrometerDto[] = PYROMETERS) {
  return renderWithApp(<ReadingsPage />, {
    listReadingsUseCase: { execute },
    listPyrometersUseCase: {
      execute: vi.fn().mockResolvedValue(pyrometers),
    },
  });
}

describe('ReadingsPage', () => {
  afterEach(() => cleanup());

  it('deve consultar o dia de hoje quando abrir', async () => {
    // Arrange
    const execute = vi.fn<ListExecute>().mockResolvedValue(pageOf(1));

    // Act
    renderPage(execute);

    // Assert
    await waitFor(() =>
      expect(execute).toHaveBeenCalledWith({ period: null, pyrometerId: null, page: 1 }),
    );
  });

  it('deve mostrar o carregando quando a consulta ainda não voltou', () => {
    // Arrange
    const execute = vi
      .fn<ListExecute>()
      .mockReturnValue(new Promise<ReadingsPageDto>(() => undefined));

    // Act
    renderPage(execute);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
  });

  it('deve mostrar a tabela quando houver leituras', async () => {
    // Arrange
    const execute = vi.fn<ListExecute>().mockResolvedValue(pageOf(1));

    // Act
    renderPage(execute);

    // Assert
    expect(await screen.findByText('01/05/2026 08:00')).toBeInTheDocument();
  });

  it('deve mostrar nenhuma leitura no período quando a lista vier vazia', async () => {
    // Arrange
    const execute = vi.fn<ListExecute>().mockResolvedValue(pageOf(0));

    // Act
    renderPage(execute);

    // Assert
    expect(await screen.findByText('Nenhuma leitura no período.')).toBeInTheDocument();
  });

  it('deve mostrar indisponível quando a consulta falhar', async () => {
    // Arrange
    const execute = vi
      .fn<ListExecute>()
      .mockRejectedValue(new ReadingsUnavailableError('falha simulada'));

    // Act
    renderPage(execute);

    // Assert
    expect(await screen.findByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
  });

  it('deve consultar o período explícito quando Consultar for acionado', async () => {
    // Arrange
    const execute = vi.fn<ListExecute>().mockResolvedValue(pageOf(1));
    renderPage(execute);
    await screen.findByText('01/05/2026 08:00');

    // Act
    fireEvent.change(screen.getByLabelText('Início'), { target: { value: '2026-04-01T08:00' } });
    fireEvent.change(screen.getByLabelText('Fim'), { target: { value: '2026-04-02T18:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Consultar' }));

    // Assert
    await waitFor(() =>
      expect(execute).toHaveBeenLastCalledWith({
        period: { start: '2026-04-01T08:00', end: '2026-04-02T18:00' },
        pyrometerId: null,
        page: 1,
      }),
    );
  });

  it('deve filtrar pelo pirômetro e voltar à página 1 quando o filtro mudar', async () => {
    // Arrange
    const execute = vi.fn<ListExecute>().mockResolvedValue(pageOf(120));
    renderPage(execute);
    await screen.findByText('01/05/2026 08:00');
    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    await waitFor(() =>
      expect(execute).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })),
    );
    await screen.findByRole('option', { name: 'Forno 1' });

    // Act
    fireEvent.change(screen.getByLabelText('Pirômetro'), { target: { value: 'SN-001' } });

    // Assert
    await waitFor(() =>
      expect(execute).toHaveBeenLastCalledWith({ period: null, pyrometerId: 'SN-001', page: 1 }),
    );
  });

  it('deve pedir a página seguinte mantendo o filtro quando paginar', async () => {
    // Arrange
    const execute = vi.fn<ListExecute>().mockResolvedValue(pageOf(120));
    renderPage(execute);
    await screen.findByText('01/05/2026 08:00');
    await screen.findByRole('option', { name: 'Forno 1' });
    fireEvent.change(screen.getByLabelText('Pirômetro'), { target: { value: 'SN-001' } });
    await waitFor(() =>
      expect(execute).toHaveBeenLastCalledWith(expect.objectContaining({ pyrometerId: 'SN-001' })),
    );

    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'Próxima' }));

    // Assert
    await waitFor(() =>
      expect(execute).toHaveBeenLastCalledWith({ period: null, pyrometerId: 'SN-001', page: 2 }),
    );
  });

  it('deve oferecer no filtro o pirômetro inativo marcado como inativo quando há inativos', async () => {
    // Arrange
    const execute = vi.fn<ListExecute>().mockResolvedValue(pageOf(1));
    const inactive: PyrometerDto = {
      ...PYROMETERS[0]!,
      id: 'SN-002',
      name: 'PI-15',
      active: false,
    };

    // Act
    renderPage(execute, [...PYROMETERS, inactive]);

    // Assert
    expect(await screen.findByRole('option', { name: 'PI-15 (inativo)' })).toBeInTheDocument();
  });

  it('deve mostrar o apelido na lista quando o pirômetro tem apelido', async () => {
    // Arrange
    const execute = vi.fn<ListExecute>().mockResolvedValue(pageOf(1));
    const nicknamed: PyrometerDto = { ...PYROMETERS[0]!, nickname: 'Forno 2' };

    // Act
    renderPage(execute, [nicknamed]);

    // Assert
    const cells = await screen.findAllByText('Forno 1 - Forno 2');
    expect(cells.length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole('cell', { name: 'Forno 1' })).toBeNull();
  });
});
