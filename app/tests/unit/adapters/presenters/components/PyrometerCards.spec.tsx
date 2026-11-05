import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PyrometerCards } from '../../../../../adapters/presenters/components/PyrometerCards';
import type { PyrometerDto } from '../../../../../core/domain/dtos/pyrometer.dto';
import type { PyrometerSeriesDto } from '../../../../../core/domain/dtos/pyrometer-series.dto';
import type { PyrometerSummaryDto } from '../../../../../core/domain/dtos/pyrometer-summary.dto';

function pyrometer(id: string, name: string, active = true): PyrometerDto {
  return { id, name, nickname: null, color: '#2563eb', note: null, active };
}

const SUMMARIES: PyrometerSummaryDto[] = [
  {
    pyrometerId: 'B',
    temperature: 1400,
    measuredAt: '2026-11-05T10:00:00',
    battery: 50,
    minutesWithoutReading: 8,
  },
];

function renderCards(
  props: {
    pyrometers?: PyrometerDto[];
    series?: PyrometerSeriesDto[];
    selectedId?: string | null;
    onSelect?: (id: string | null) => void;
  } = {},
) {
  return render(
    <PyrometerCards
      pyrometers={props.pyrometers ?? [pyrometer('B', 'PI-14'), pyrometer('A', 'PI-12')]}
      summaries={SUMMARIES}
      series={props.series ?? []}
      selectedId={props.selectedId ?? null}
      onSelect={props.onSelect ?? vi.fn()}
    />,
  );
}

describe('PyrometerCards', () => {
  afterEach(() => cleanup());

  it('deve listar os cards em ordem alfabetica pelo nome mostrado quando renderizado', () => {
    // Arrange / Act
    renderCards();

    // Assert
    const names = screen.getAllByRole('button').map((card) => card.textContent ?? '');
    expect(names[0]).toContain('PI-12');
    expect(names[1]).toContain('PI-14');
  });

  it('deve esconder os pirometros inativos quando ha ativos e inativos', () => {
    // Arrange / Act
    renderCards({ pyrometers: [pyrometer('A', 'PI-12'), pyrometer('B', 'PI-14', false)] });

    // Assert
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.queryByText('PI-14')).toBeNull();
  });

  it('deve mostrar o resumo de cada pirometro no card certo quando ha resumo', () => {
    // Arrange / Act
    renderCards();

    // Assert
    const cardB = screen.getAllByRole('button')[1];
    expect(cardB).toBeDefined();
    expect(within(cardB as HTMLElement).getByText('1400 °C')).toBeInTheDocument();
  });

  it('deve chamar onSelect com o serial quando um card nao selecionado e clicado', () => {
    // Arrange
    const onSelect = vi.fn<(id: string | null) => void>();
    renderCards({ onSelect });

    // Act
    fireEvent.click(screen.getAllByRole('button')[0] as HTMLElement);

    // Assert
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('A');
  });

  it('deve chamar onSelect com nulo quando o card selecionado e clicado de novo', () => {
    // Arrange
    const onSelect = vi.fn<(id: string | null) => void>();
    renderCards({ selectedId: 'A', onSelect });

    // Act
    fireEvent.click(screen.getByRole('button', { pressed: true }));

    // Assert
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('deve marcar so o card selecionado como pressionado quando ha selecao', () => {
    // Arrange / Act
    renderCards({ selectedId: 'B' });

    // Assert
    const pressed = screen.getAllByRole('button', { pressed: true });
    expect(pressed).toHaveLength(1);
    expect(pressed[0]).toHaveTextContent('PI-14');
  });

  it('deve ficar em grade de 2, 3 e 4 colunas sem rolagem horizontal quando ha dez cards', () => {
    // Arrange
    const many = Array.from({ length: 10 }, (_, index) => pyrometer(`S${index}`, `PI-${index}`));

    // Act
    const { container } = renderCards({ pyrometers: many });

    // Assert
    const grid = container.querySelector('ul');
    expect(screen.getAllByRole('button')).toHaveLength(10);
    expect(grid?.className).toContain('grid-cols-2');
    expect(grid?.className).toContain('lg:grid-cols-3');
    expect(grid?.className).toContain('xl:grid-cols-4');
    expect(grid?.className).not.toContain('overflow-x');
  });

  it('deve nomear a secao em portugues quando renderizado', () => {
    // Arrange / Act
    renderCards();

    // Assert
    expect(screen.getByRole('region', { name: 'Visão geral dos pirômetros' })).toBeInTheDocument();
  });
});
