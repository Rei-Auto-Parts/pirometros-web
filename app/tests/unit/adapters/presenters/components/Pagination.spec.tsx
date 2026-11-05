import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Pagination } from '@/adapters/presenters/components/Pagination';

const PREVIOUS = 'Anterior';
const NEXT = 'Próxima';

describe('Pagination', () => {
  it('deve habilitar os dois botões e chamar onChange com a página certa quando estiver no meio', async () => {
    // Arrange
    const onChange = vi.fn();
    render(<Pagination page={2} total={150} pageSize={50} onChange={onChange} />);
    // Act
    await userEvent.click(screen.getByRole('button', { name: PREVIOUS }));
    await userEvent.click(screen.getByRole('button', { name: NEXT }));
    // Assert
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenNthCalledWith(1, 1);
    expect(onChange).toHaveBeenNthCalledWith(2, 3);
  });

  it('deve desabilitar Anterior quando estiver na primeira página', () => {
    // Arrange
    const onChange = vi.fn();
    // Act
    render(<Pagination page={1} total={150} pageSize={50} onChange={onChange} />);
    // Assert
    expect(screen.getByRole('button', { name: PREVIOUS })).toBeDisabled();
    expect(screen.getByRole('button', { name: NEXT })).toBeEnabled();
  });

  it('deve desabilitar Próxima quando estiver na última página', () => {
    // Arrange
    const onChange = vi.fn();
    // Act
    render(<Pagination page={3} total={150} pageSize={50} onChange={onChange} />);
    // Assert
    expect(screen.getByRole('button', { name: NEXT })).toBeDisabled();
    expect(screen.getByRole('button', { name: PREVIOUS })).toBeEnabled();
  });

  it('deve mostrar Página 1 de 1 e desabilitar os dois botões quando total for 0', () => {
    // Arrange
    const onChange = vi.fn();
    // Act
    render(<Pagination page={1} total={0} pageSize={50} onChange={onChange} />);
    // Assert
    expect(screen.getByText('Página 1 de 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: PREVIOUS })).toBeDisabled();
    expect(screen.getByRole('button', { name: NEXT })).toBeDisabled();
  });

  it('deve calcular 3 páginas quando houver 101 itens com tamanho 50', () => {
    // Arrange
    const onChange = vi.fn();
    // Act
    render(<Pagination page={1} total={101} pageSize={50} onChange={onChange} />);
    // Assert
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
  });
});
