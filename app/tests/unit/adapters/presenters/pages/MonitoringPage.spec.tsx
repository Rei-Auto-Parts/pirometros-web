import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';

import { MonitoringPage } from '../../../../../adapters/presenters/pages/MonitoringPage';
import type { ChartPeriodKey } from '../../../../../core/domain/constants/chart-periods.constants';
import type { PyrometerDto } from '../../../../../core/domain/dtos/pyrometer.dto';
import type { PyrometerSeriesDto } from '../../../../../core/domain/dtos/pyrometer-series.dto';
import type { PyrometerSummaryDto } from '../../../../../core/domain/dtos/pyrometer-summary.dto';
import { ReadingsUnavailableError } from '../../../../../core/domain/errors/readings-unavailable.error';
import { renderWithApp } from '../test-render';

type SeriesExecute = (
  pyrometerId: string | null,
  period?: ChartPeriodKey,
) => Promise<PyrometerSeriesDto[]>;

const SERIES: PyrometerSeriesDto[] = [
  {
    pyrometerId: 'SN-001',
    pyrometerName: 'Forno 1',
    points: [{ measuredAt: '2026-05-01T08:00:00', temperature: 700 }],
  },
];

const PYROMETER: PyrometerDto = {
  id: 'SN-001',
  name: 'Forno 1',
  nickname: null,
  color: '#2563eb',
  note: null,
  active: true,
};

const SUMMARY: PyrometerSummaryDto = {
  pyrometerId: 'SN-001',
  temperature: 700,
  measuredAt: '2026-05-01T08:00:00',
  battery: 80,
  minutesWithoutReading: 3,
};

function renderPage(
  execute: Mock<SeriesExecute>,
  options: { pyrometers?: PyrometerDto[]; summaries?: PyrometerSummaryDto[] } = {},
) {
  return renderWithApp(<MonitoringPage />, {
    getReadingsSeriesUseCase: { execute },
    listPyrometersUseCase: {
      execute: vi.fn().mockResolvedValue(options.pyrometers ?? [PYROMETER]),
    },
    listPyrometerSummariesUseCase: {
      execute: vi.fn().mockResolvedValue(options.summaries ?? [SUMMARY]),
    },
  });
}

describe('MonitoringPage', () => {
  afterEach(() => cleanup());

  it('deve mostrar o carregando quando a série ainda não chegou', () => {
    // Arrange
    const execute = vi
      .fn<SeriesExecute>()
      .mockReturnValue(new Promise<PyrometerSeriesDto[]>(() => undefined));

    // Act
    renderPage(execute);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
  });

  it('deve mostrar o gráfico quando houver séries', async () => {
    // Arrange
    const execute = vi.fn<SeriesExecute>().mockResolvedValue(SERIES);

    // Act
    renderPage(execute);

    // Assert
    expect(await screen.findByRole('img', { name: 'Gráfico de temperaturas' })).toBeInTheDocument();
  });

  it('deve mostrar nenhuma leitura hoje quando não houver séries', async () => {
    // Arrange
    const execute = vi.fn<SeriesExecute>().mockResolvedValue([]);

    // Act
    renderPage(execute);

    // Assert
    expect(await screen.findByText('Nenhuma leitura hoje.')).toBeInTheDocument();
  });

  it('deve mostrar nenhuma leitura no período quando o período não é hoje e não há séries', async () => {
    // Arrange
    const execute = vi.fn<SeriesExecute>().mockResolvedValue([]);
    renderPage(execute);
    await screen.findByText('Nenhuma leitura hoje.');

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Últimas 6 horas' }));

    // Assert
    expect(await screen.findByText('Nenhuma leitura no período.')).toBeInTheDocument();
  });

  it('deve mostrar um só alerta com tentar de novo quando a consulta falhar', async () => {
    // Arrange
    const execute = vi
      .fn<SeriesExecute>()
      .mockRejectedValueOnce(new ReadingsUnavailableError('falha simulada'))
      .mockResolvedValue(SERIES);
    renderPage(execute);

    // Act
    const retry = await screen.findByRole('button', { name: 'Tentar de novo' });
    fireEvent.click(retry);

    // Assert
    expect(await screen.findByRole('img', { name: 'Gráfico de temperaturas' })).toBeInTheDocument();
    expect(screen.queryAllByRole('button', { name: 'Tentar de novo' })).toHaveLength(0);
  });

  it('deve consultar a série do pirômetro escolhido quando o filtro mudar', async () => {
    // Arrange
    const execute = vi.fn<SeriesExecute>().mockResolvedValue(SERIES);
    renderPage(execute);
    const select = await screen.findByLabelText('Pirômetro');
    await screen.findByRole('option', { name: 'Forno 1' });

    // Act
    fireEvent.change(select, { target: { value: 'SN-001' } });

    // Assert
    await waitFor(() => expect(execute).toHaveBeenLastCalledWith('SN-001', 'today'));
  });

  it('deve mostrar um card por pirômetro ativo quando há resumo', async () => {
    // Arrange
    const execute = vi.fn<SeriesExecute>().mockResolvedValue(SERIES);

    // Act
    renderPage(execute);

    // Assert
    const cards = await screen.findByRole('region', { name: 'Visão geral dos pirômetros' });
    expect(within(cards).getByRole('button', { name: /Forno 1/ })).toHaveTextContent('700 °C');
  });

  it('deve filtrar o gráfico e o filtro quando um card é clicado', async () => {
    // Arrange
    const execute = vi.fn<SeriesExecute>().mockResolvedValue(SERIES);
    renderPage(execute);
    const cards = await screen.findByRole('region', { name: 'Visão geral dos pirômetros' });

    // Act
    fireEvent.click(within(cards).getByRole('button', { name: /Forno 1/ }));

    // Assert
    await waitFor(() => expect(execute).toHaveBeenLastCalledWith('SN-001', 'today'));
    expect(screen.getByLabelText('Pirômetro')).toHaveValue('SN-001');
  });

  it('deve voltar a mostrar todos quando o mesmo card é clicado de novo', async () => {
    // Arrange
    const execute = vi.fn<SeriesExecute>().mockResolvedValue(SERIES);
    renderPage(execute);
    const cards = await screen.findByRole('region', { name: 'Visão geral dos pirômetros' });
    fireEvent.click(within(cards).getByRole('button', { name: /Forno 1/ }));
    await waitFor(() => expect(screen.getByLabelText('Pirômetro')).toHaveValue('SN-001'));

    // Act
    fireEvent.click(within(cards).getByRole('button', { name: /Forno 1/ }));

    // Assert
    await waitFor(() => expect(screen.getByLabelText('Pirômetro')).toHaveValue(''));
  });

  it('deve marcar o card quando o filtro escolhe o pirômetro', async () => {
    // Arrange
    const execute = vi.fn<SeriesExecute>().mockResolvedValue(SERIES);
    renderPage(execute);
    await screen.findByRole('option', { name: 'Forno 1' });

    // Act
    fireEvent.change(screen.getByLabelText('Pirômetro'), { target: { value: 'SN-001' } });

    // Assert
    const cards = screen.getByRole('region', { name: 'Visão geral dos pirômetros' });
    expect(within(cards).getByRole('button', { pressed: true })).toHaveTextContent('Forno 1');
  });

  it('deve consultar o período escolhido mantendo o pirômetro quando o período muda', async () => {
    // Arrange
    const execute = vi.fn<SeriesExecute>().mockResolvedValue(SERIES);
    renderPage(execute);
    await screen.findByRole('option', { name: 'Forno 1' });
    fireEvent.change(screen.getByLabelText('Pirômetro'), { target: { value: 'SN-001' } });
    await waitFor(() => expect(execute).toHaveBeenLastCalledWith('SN-001', 'today'));

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Últimas 24 horas' }));

    // Assert
    await waitFor(() => expect(execute).toHaveBeenLastCalledWith('SN-001', 'day'));
  });

  it('deve esconder o pirômetro inativo dos cards, do filtro e do gráfico quando há inativo', async () => {
    // Arrange
    const inactive: PyrometerDto = { ...PYROMETER, id: 'SN-002', name: 'PI-15', active: false };
    const both: PyrometerSeriesDto[] = [
      ...SERIES,
      { pyrometerId: 'SN-002', pyrometerName: 'PI-15', points: SERIES[0]!.points },
    ];
    const execute = vi.fn<SeriesExecute>().mockResolvedValue(both);

    // Act
    renderPage(execute, { pyrometers: [PYROMETER, inactive] });

    // Assert
    await screen.findByRole('img', { name: 'Gráfico de temperaturas' });
    expect(screen.queryByRole('option', { name: /PI-15/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /PI-15/ })).toBeNull();
    expect(screen.queryByText('PI-15')).toBeNull();
  });

  it('deve fazer so a consulta do grafico quando abre, sem consulta extra para miniaturas', async () => {
    // Arrange
    const execute = vi.fn<SeriesExecute>().mockResolvedValue(SERIES);

    // Act
    renderPage(execute);
    await screen.findByRole('img', { name: 'Gráfico de temperaturas' });

    // Assert
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith(null, 'today');
  });

  it('deve nao mostrar miniatura nos cards quando ha cards', async () => {
    // Arrange
    const execute = vi.fn<SeriesExecute>().mockResolvedValue(SERIES);

    // Act
    renderPage(execute);
    const cards = await screen.findByRole('region', { name: 'Visão geral dos pirômetros' });

    // Assert
    expect(within(cards).queryAllByRole('img')).toHaveLength(0);
  });
});
