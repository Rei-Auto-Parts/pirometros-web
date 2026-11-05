import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from '../../../../../adapters/presenters/components/ThemeToggle';

describe('ThemeToggle', () => {
  it('deve oferecer o tema escuro quando o tema atual e o claro', () => {
    // Arrange
    const onToggle = vi.fn();

    // Act
    render(<ThemeToggle theme="light" onToggle={onToggle} />);

    // Assert
    expect(screen.getByRole('button', { name: 'Tema escuro' })).toBeInTheDocument();
  });

  it('deve oferecer o tema claro quando o tema atual e o escuro', () => {
    // Arrange
    const onToggle = vi.fn();

    // Act
    render(<ThemeToggle theme="dark" onToggle={onToggle} />);

    // Assert
    expect(screen.getByRole('button', { name: 'Tema claro' })).toBeInTheDocument();
  });

  it('deve chamar onToggle uma vez quando o botao e clicado', async () => {
    // Arrange
    const onToggle = vi.fn();
    render(<ThemeToggle theme="light" onToggle={onToggle} />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Tema escuro' }));

    // Assert
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
