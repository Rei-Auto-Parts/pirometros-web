import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppLayout } from '../../../../../adapters/presenters/layout/AppLayout';

function renderLayout() {
  const router = createMemoryRouter([
    { path: '/', element: <AppLayout />, children: [{ index: true, element: <p>conteudo</p> }] },
  ]);
  return render(<RouterProvider router={router} />);
}

describe('AppLayout', () => {
  it('deve mostrar o menu lateral vazio quando nao ha itens de navegacao', () => {
    // Act
    renderLayout();

    // Assert
    const sidebar = screen.getByRole('complementary', { name: 'Menu lateral' });
    const navigation = within(sidebar).getByRole('navigation', { name: 'Navegação principal' });
    expect(within(navigation).queryAllByRole('listitem')).toHaveLength(0);
  });

  it('deve renderizar a rota filha na area principal', () => {
    // Act
    renderLayout();

    // Assert
    expect(within(screen.getByRole('main')).getByText('conteudo')).toBeInTheDocument();
  });
});
