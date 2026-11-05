import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PyrometerCard } from '../../../../../adapters/presenters/components/PyrometerCard';
import type { PyrometerDto } from '../../../../../core/domain/dtos/pyrometer.dto';
import type { PyrometerSummaryDto } from '../../../../../core/domain/dtos/pyrometer-summary.dto';

const PYROMETER: PyrometerDto = {
  id: 'SN-1',
  name: 'PI-12',
  nickname: 'Forno 2',
  color: '#e11d48',
  note: null,
  active: true,
};

function summary(overrides: Partial<PyrometerSummaryDto> = {}): PyrometerSummaryDto {
  return {
    pyrometerId: 'SN-1',
    temperature: 1510,
    measuredAt: '2026-11-05T10:05:00',
    battery: 62,
    minutesWithoutReading: 3,
    ...overrides,
  };
}

function renderCard(
  props: {
    summary?: PyrometerSummaryDto | undefined;
    selected?: boolean;
    onSelect?: () => void;
  } = {},
) {
  const resolved = 'summary' in props ? props.summary : summary();
  return render(
    <PyrometerCard
      pyrometer={PYROMETER}
      summary={resolved}
      selected={props.selected ?? false}
      onSelect={props.onSelect ?? vi.fn()}
    />,
  );
}

describe('PyrometerCard', () => {
  afterEach(() => cleanup());

  it('deve mostrar nome, temperatura, data, bateria e tempo sem leitura quando ha resumo', () => {
    // Arrange / Act
    renderCard();

    // Assert
    const card = screen.getByRole('button');
    expect(card).toHaveTextContent('PI-12 - Forno 2');
    expect(card).toHaveTextContent('1510 °C');
    expect(card).toHaveTextContent('05/11/2026 10:05');
    expect(card).toHaveTextContent('Bateria 62%');
    expect(card).toHaveTextContent('3 min sem leitura');
  });

  it('deve mostrar a bateria como travessao quando ela e nula', () => {
    // Arrange / Act
    renderCard({ summary: summary({ battery: null }) });

    // Assert
    expect(screen.getByRole('button')).toHaveTextContent('Bateria —');
  });

  it.each([
    [0, '0 min sem leitura'],
    [59, '59 min sem leitura'],
    [60, '1 h sem leitura'],
    [65, '1 h 05 min sem leitura'],
    [600, '10 h sem leitura'],
  ])('deve escrever %i minutos como "%s" quando mostra o tempo sem leitura', (minutes, text) => {
    // Arrange / Act
    renderCard({ summary: summary({ minutesWithoutReading: minutes }) });

    // Assert
    expect(screen.getByRole('button')).toHaveTextContent(text);
  });

  it('deve mostrar que nao ha leituras com temperatura quando nao ha resumo', () => {
    // Arrange / Act
    renderCard({ summary: undefined });

    // Assert
    expect(screen.getByRole('button')).toHaveTextContent('Sem leituras com temperatura');
  });

  it('deve mostrar a cor do pirometro como bolinha e o nome escrito quando renderizado', () => {
    // Arrange / Act
    const { container } = renderCard();

    // Assert
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).toHaveStyle({ backgroundColor: '#e11d48' });
    expect(screen.getByRole('button')).toHaveTextContent('PI-12 - Forno 2');
  });

  it('deve chamar onSelect uma vez quando o card e clicado', () => {
    // Arrange
    const onSelect = vi.fn<() => void>();
    renderCard({ onSelect });

    // Act
    fireEvent.click(screen.getByRole('button'));

    // Assert
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('deve marcar o card como pressionado quando esta selecionado', () => {
    // Arrange / Act
    renderCard({ selected: true });

    // Assert
    expect(screen.getByRole('button', { pressed: true })).toBeInTheDocument();
  });

  it('deve manter a mesma aparencia quando o tempo sem leitura e muito grande', () => {
    // Arrange
    const { container: recent } = renderCard({ summary: summary({ minutesWithoutReading: 1 }) });
    const recentClass = recent.querySelector('button')?.className;
    cleanup();

    // Act
    const { container: stale } = renderCard({ summary: summary({ minutesWithoutReading: 5000 }) });

    // Assert
    expect(stale.querySelector('button')?.className).toBe(recentClass);
    expect(stale.querySelector('[role="alert"]')).toBeNull();
  });

  it('deve manter a mesma aparencia quando a bateria e muito baixa', () => {
    // Arrange
    const { container: full } = renderCard({ summary: summary({ battery: 100 }) });
    const fullClass = full.querySelector('button')?.className;
    cleanup();

    // Act
    const { container: low } = renderCard({ summary: summary({ battery: 1 }) });

    // Assert
    expect(low.querySelector('button')?.className).toBe(fullClass);
  });

  it('deve nao ter miniatura nem grafico quando renderizado', () => {
    // Arrange / Act
    const { container } = renderCard();

    // Assert
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.querySelector('.recharts-wrapper')).toBeNull();
  });

  it('deve manter so nome, display, data, bateria e tempo sem leitura quando ha resumo', () => {
    // Arrange / Act
    renderCard();

    // Assert
    const card = screen.getByRole('button');
    expect(card).toHaveTextContent('PI-12 - Forno 2');
    expect(card).toHaveTextContent('1510 °C');
    expect(card).toHaveTextContent('05/11/2026 10:05');
    expect(card).toHaveTextContent('Bateria 62%');
    expect(card).toHaveTextContent('3 min sem leitura');
    expect(card.querySelectorAll('svg')).toHaveLength(1);
  });

  it('deve mostrar a bateria em porcentagem com barra proporcional quando ha resumo', () => {
    // Arrange / Act
    const { container } = renderCard();

    // Assert
    expect(container.querySelector('[data-battery-bar]')).toHaveStyle({ width: '62%' });
  });

  it('deve limitar a barra de bateria a 100% quando a bateria passa de 100', () => {
    // Arrange / Act
    const { container } = renderCard({ summary: summary({ battery: 130 }) });

    // Assert
    expect(container.querySelector('[data-battery-bar]')).toHaveStyle({ width: '100%' });
    expect(screen.getByRole('button')).toHaveTextContent('Bateria 130%');
  });

  it('deve nao mostrar barra quando a bateria e nula', () => {
    // Arrange / Act
    const { container } = renderCard({ summary: summary({ battery: null }) });

    // Assert
    expect(container.querySelector('[data-battery-bar]')).toBeNull();
  });

  it('deve mostrar a temperatura em display de 7 segmentos com o valor real em texto quando ha resumo', () => {
    // Arrange / Act
    const { container } = renderCard();

    // Assert
    const cells = [...container.querySelectorAll('[data-char]')].map((cell) =>
      cell.getAttribute('data-char'),
    );
    expect(cells).toEqual(['1', '5', '1', '0']);
    expect(container.querySelector('.sr-only')).toHaveTextContent('1510 °C');
  });

  it('deve mostrar tracos no display quando nao ha resumo', () => {
    // Arrange / Act
    const { container } = renderCard({ summary: undefined });

    // Assert
    const cells = [...container.querySelectorAll('[data-char]')].map((cell) =>
      cell.getAttribute('data-char'),
    );
    expect(cells).toEqual([' ', '-', '-', '-']);
    expect(screen.getByRole('button')).toHaveTextContent('Sem leituras com temperatura');
  });

  it('deve nao mostrar o codigo do local quando ha resumo', () => {
    // Arrange / Act
    renderCard();

    // Assert
    expect(screen.getByRole('button').textContent).not.toMatch(/local|place/i);
  });

  it('deve manter o display com a mesma cor de LED quando a cor do pirometro muda', () => {
    // Arrange
    const panelClass = (container: HTMLElement): string | undefined =>
      container.querySelector('svg')?.parentElement?.className;
    const { container: first } = renderCard();
    const firstClass = panelClass(first);
    cleanup();

    // Act
    const { container: second } = render(
      <PyrometerCard
        pyrometer={{ ...PYROMETER, color: '#16a34a' }}
        summary={summary({ temperature: 5000 })}
        selected={false}
        onSelect={vi.fn()}
      />,
    );

    // Assert
    expect(panelClass(second)).toBe(firstClass);
    expect(firstClass).toContain('text-red-500');
  });
});
