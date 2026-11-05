import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { AppLayout } from '../../../../../adapters/presenters/layout/AppLayout';

function renderLayout() {
  const router = createMemoryRouter([
    {
      path: '/',
      element: <AppLayout />,
      children: [
        { index: true, element: <p>conteudo</p> },
        { path: 'leituras', element: <p>outra tela</p> },
      ],
    },
  ]);
  return render(<RouterProvider router={router} />);
}

describe('AppLayout', () => {
  afterEach(() => {
    cleanup();
    document.documentElement.classList.remove('dark');
  });

  it('deve mostrar os quatro itens do menu quando renderizado', () => {
    // Arrange
    // Act
    renderLayout();

    // Assert
    const navigation = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(
      within(navigation)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['Acompanhamento', 'Leituras', 'Pirômetros', 'Saúde do sistema']);
  });

  it('deve renderizar a rota filha na area principal', () => {
    // Arrange
    // Act
    renderLayout();

    // Assert
    expect(within(screen.getByRole('main')).getByText('conteudo')).toBeInTheDocument();
  });

  it('deve manter o menu recolhido quando trocar de tela', () => {
    // Arrange
    renderLayout();
    fireEvent.click(screen.getByRole('button', { name: 'Recolher menu' }));

    // Act
    fireEvent.click(screen.getByRole('link', { name: 'Leituras' }));

    // Assert
    expect(screen.getByText('outra tela')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expandir menu' })).toBeInTheDocument();
  });

  it('deve abrir com o menu expandido quando renderizado', () => {
    // Arrange
    // Act
    renderLayout();

    // Assert
    expect(screen.getByRole('button', { name: 'Recolher menu' })).toBeInTheDocument();
  });

  it('deve alternar o tema quando o botão de tema for acionado', () => {
    // Arrange
    renderLayout();

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Tema escuro' }));

    // Assert
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
