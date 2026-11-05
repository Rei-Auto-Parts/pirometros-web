import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { SidebarNav } from '../../../../../adapters/presenters/components/SidebarNav';
import { ROUTES } from '../../../../../core/domain/constants/routes.constants';

function renderNav(collapsed: boolean, onToggle: () => void = vi.fn(), entry: string = '/') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <SidebarNav collapsed={collapsed} onToggle={onToggle} />
    </MemoryRouter>,
  );
}

const ITEMS: ReadonlyArray<readonly [string, string]> = [
  ['Acompanhamento', ROUTES.monitoring],
  ['Leituras', ROUTES.readings],
  ['Pirômetros', ROUTES.pyrometers],
  ['Saúde do sistema', ROUTES.health],
];

describe('SidebarNav', () => {
  it.each(ITEMS)('deve exibir o link %s com o href correto quando expandido', (name, href) => {
    // Arrange
    renderNav(false);

    // Act
    const link = screen.getByRole('link', { name });

    // Assert
    expect(link).toHaveAttribute('href', href);
  });

  it('deve rotular a navegacao e listar 4 itens quando renderizado', () => {
    // Arrange
    renderNav(false);

    // Act
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });

    // Assert
    expect(nav.querySelectorAll('li')).toHaveLength(4);
  });

  it('deve marcar apenas o item da rota atual com aria-current quando a rota e /leituras', () => {
    // Arrange
    renderNav(false, vi.fn(), '/leituras');

    // Act
    const current = screen
      .getAllByRole('link')
      .filter((l) => l.getAttribute('aria-current') === 'page');

    // Assert
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveAccessibleName('Leituras');
  });

  it.each(ITEMS)('deve manter o link %s acessivel por nome e title quando recolhido', (name) => {
    // Arrange
    renderNav(true);

    // Act
    const link = screen.getByRole('link', { name });

    // Assert
    expect(link).toHaveAttribute('title', name);
  });

  it('deve chamar onToggle 1 vez quando o botao e clicado', async () => {
    // Arrange
    const onToggle = vi.fn();
    renderNav(false, onToggle);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Recolher menu' }));

    // Assert
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('deve rotular Recolher menu com aria-expanded true quando expandido', () => {
    // Arrange
    renderNav(false);

    // Act
    const button = screen.getByRole('button', { name: 'Recolher menu' });

    // Assert
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('deve rotular Expandir menu com aria-expanded false quando recolhido', () => {
    // Arrange
    renderNav(true);

    // Act
    const button = screen.getByRole('button', { name: 'Expandir menu' });

    // Assert
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('deve tornar o item a rota atual quando ele e clicado', async () => {
    // Arrange
    renderNav(false);

    // Act
    await userEvent.click(screen.getByRole('link', { name: 'Saúde do sistema' }));

    // Assert
    expect(screen.getByRole('link', { name: 'Saúde do sistema' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Acompanhamento' })).not.toHaveAttribute(
      'aria-current',
    );
  });
});
