import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChartPeriodSelect } from '../../../../../adapters/presenters/components/ChartPeriodSelect';
import type { ChartPeriodKey } from '../../../../../core/domain/constants/chart-periods.constants';

describe('ChartPeriodSelect', () => {
  afterEach(() => cleanup());

  it('deve listar os cinco periodos na ordem quando renderizado', () => {
    // Arrange / Act
    render(<ChartPeriodSelect value="today" onChange={vi.fn()} />);

    // Assert
    const labels = screen.getAllByRole('button').map((button) => button.textContent);
    expect(labels).toEqual([
      'Última hora',
      'Últimas 6 horas',
      'Últimas 24 horas',
      'Hoje',
      'Últimos 3 dias',
    ]);
  });

  it('deve marcar so o periodo atual como pressionado quando renderizado', () => {
    // Arrange / Act
    render(<ChartPeriodSelect value="sixHours" onChange={vi.fn()} />);

    // Assert
    const pressed = screen.getAllByRole('button', { pressed: true });
    expect(pressed).toHaveLength(1);
    expect(pressed[0]).toHaveTextContent('Últimas 6 horas');
  });

  it('deve chamar onChange com a chave do periodo quando um botao e clicado', () => {
    // Arrange
    const onChange = vi.fn<(period: ChartPeriodKey) => void>();
    render(<ChartPeriodSelect value="today" onChange={onChange} />);

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Últimos 3 dias' }));

    // Assert
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('threeDays');
  });

  it('deve rotular o grupo em portugues quando renderizado', () => {
    // Arrange / Act
    render(<ChartPeriodSelect value="today" onChange={vi.fn()} />);

    // Assert
    expect(screen.getByRole('group', { name: 'Período do gráfico' })).toBeInTheDocument();
  });
});
