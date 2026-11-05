import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Switch } from '../../../../../adapters/presenters/components/Switch';

describe('Switch', () => {
  afterEach(() => cleanup());

  it('deve expor um interruptor com o rotulo quando renderizado', () => {
    // Arrange / Act
    render(<Switch label="Ativo" checked onChange={vi.fn()} />);

    // Assert
    expect(screen.getByRole('switch', { name: 'Ativo' })).toBeInTheDocument();
  });

  it('deve refletir o estado ligado quando checked e verdadeiro', () => {
    // Arrange / Act
    render(<Switch label="Ativo" checked onChange={vi.fn()} />);

    // Assert
    expect(screen.getByLabelText('Ativo')).toBeChecked();
  });

  it('deve refletir o estado desligado quando checked e falso', () => {
    // Arrange / Act
    render(<Switch label="Ativo" checked={false} onChange={vi.fn()} />);

    // Assert
    expect(screen.getByLabelText('Ativo')).not.toBeChecked();
  });

  it('deve chamar onChange com o novo valor quando e clicado', () => {
    // Arrange
    const onChange = vi.fn<(checked: boolean) => void>();
    render(<Switch label="Ativo" checked={false} onChange={onChange} />);

    // Act
    fireEvent.click(screen.getByRole('switch', { name: 'Ativo' }));

    // Assert
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('deve ser alcancavel pelo teclado quando renderizado', () => {
    // Arrange / Act
    render(<Switch label="Ativo" checked onChange={vi.fn()} />);

    // Assert
    expect(screen.getByRole('switch')).not.toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('switch')).toBeEnabled();
  });
});
