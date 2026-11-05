import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StateMessage } from '../../../../../adapters/presenters/components/StateMessage';

describe('StateMessage', () => {
  it('deve mostrar o texto de carregamento quando o estado e loading', () => {
    // Arrange
    const onRetry = vi.fn();

    // Act
    render(<StateMessage state="loading" emptyText="Nenhuma leitura hoje." onRetry={onRetry} />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Carregando…');
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('deve mostrar o texto recebido quando o estado e empty', () => {
    // Arrange
    const onRetry = vi.fn();

    // Act
    render(<StateMessage state="empty" emptyText="Nenhuma leitura hoje." onRetry={onRetry} />);

    // Assert
    expect(screen.getByText('Nenhuma leitura hoje.')).toBeInTheDocument();
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('deve mostrar o alerta e o botao quando o estado e error', () => {
    // Arrange
    const onRetry = vi.fn();

    // Act
    render(<StateMessage state="error" emptyText="Nenhuma leitura hoje." onRetry={onRetry} />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('Os dados estão indisponíveis no momento.');
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
  });

  it('deve chamar onRetry uma vez quando o botao Tentar de novo e clicado', async () => {
    // Arrange
    const onRetry = vi.fn();
    render(<StateMessage state="error" emptyText="Nenhuma leitura hoje." onRetry={onRetry} />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    // Assert
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
