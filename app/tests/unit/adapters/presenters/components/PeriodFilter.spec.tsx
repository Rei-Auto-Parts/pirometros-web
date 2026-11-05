import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PeriodFilter } from '../../../../../adapters/presenters/components/PeriodFilter';

const START = '2026-05-01T08:00';
const END = '2026-05-01T18:00';

type Handlers = {
  onStartChange: ReturnType<typeof vi.fn<(value: string) => void>>;
  onEndChange: ReturnType<typeof vi.fn<(value: string) => void>>;
  onSubmit: ReturnType<typeof vi.fn<() => void>>;
};

function renderFilter(start: string, end: string): Handlers {
  const handlers: Handlers = { onStartChange: vi.fn(), onEndChange: vi.fn(), onSubmit: vi.fn() };
  render(<PeriodFilter start={start} end={end} {...handlers} />);
  return handlers;
}

describe('PeriodFilter', () => {
  afterEach(() => cleanup());

  it('deve mostrar os valores recebidos quando renderizado', () => {
    // Arrange
    // Act
    renderFilter(START, END);

    // Assert
    expect(screen.getByLabelText('Início')).toHaveProperty('value', START);
    expect(screen.getByLabelText('Fim')).toHaveProperty('value', END);
  });

  it('deve chamar onStartChange com o valor quando o início for alterado', () => {
    // Arrange
    const handlers = renderFilter(START, END);

    // Act
    fireEvent.change(screen.getByLabelText('Início'), { target: { value: '2026-05-01T09:30' } });

    // Assert
    expect(handlers.onStartChange).toHaveBeenCalledTimes(1);
    expect(handlers.onStartChange).toHaveBeenCalledWith('2026-05-01T09:30');
    expect(handlers.onEndChange).not.toHaveBeenCalled();
  });

  it('deve chamar onEndChange com o valor quando o fim for alterado', () => {
    // Arrange
    const handlers = renderFilter(START, END);

    // Act
    fireEvent.change(screen.getByLabelText('Fim'), { target: { value: '2026-05-01T20:15' } });

    // Assert
    expect(handlers.onEndChange).toHaveBeenCalledTimes(1);
    expect(handlers.onEndChange).toHaveBeenCalledWith('2026-05-01T20:15');
    expect(handlers.onStartChange).not.toHaveBeenCalled();
  });

  it('deve chamar onSubmit uma vez quando o período for válido e o botão clicado', () => {
    // Arrange
    const handlers = renderFilter(START, END);
    const button = screen.getByRole('button', { name: 'Consultar' });

    // Act
    fireEvent.click(button);

    // Assert
    expect(button).toHaveProperty('disabled', false);
    expect(handlers.onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('deve avisar e desabilitar a consulta quando o início for posterior ao fim', () => {
    // Arrange
    const handlers = renderFilter(END, START);
    const button = screen.getByRole('button', { name: 'Consultar' });

    // Act
    fireEvent.click(button);

    // Assert
    expect(screen.getByRole('alert').textContent).toBe('O início deve ser anterior ao fim.');
    expect(button).toHaveProperty('disabled', true);
    expect(handlers.onSubmit).not.toHaveBeenCalled();
  });

  it('deve aceitar o período quando o início for igual ao fim', () => {
    // Arrange
    const handlers = renderFilter(START, START);
    const button = screen.getByRole('button', { name: 'Consultar' });

    // Act
    fireEvent.click(button);

    // Assert
    expect(screen.queryByRole('alert')).toBeNull();
    expect(handlers.onSubmit).toHaveBeenCalledTimes(1);
  });
});
