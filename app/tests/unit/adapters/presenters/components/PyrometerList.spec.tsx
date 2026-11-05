import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PyrometerList } from '../../../../../adapters/presenters/components/PyrometerList';
import type { PyrometerDto } from '../../../../../core/domain/dtos/pyrometer.dto';

function pyrometer(id: string, name: string, overrides: Partial<PyrometerDto> = {}): PyrometerDto {
  return { id, name, nickname: null, color: '#2563eb', note: null, active: true, ...overrides };
}

const LIST: PyrometerDto[] = [
  pyrometer('S-12', 'PI-12', {
    nickname: 'Forno 1',
    note: 'termopar trocado em 03/11',
    color: '#e11d48',
  }),
  pyrometer('S-13', 'PI-13'),
  pyrometer('S-15', 'PI-15', { active: false }),
];

function renderList(selectedId: string | null = 'S-12', onSelect = vi.fn<(id: string) => void>()) {
  render(<PyrometerList pyrometers={LIST} selectedId={selectedId} onSelect={onSelect} />);
  return onSelect;
}

describe('PyrometerList', () => {
  afterEach(() => cleanup());

  it('deve ter uma linha por pirometro numa lista rotulada quando renderizada', () => {
    // Arrange / Act
    renderList();

    // Assert
    const list = screen.getByRole('listbox', { name: 'Lista de pirômetros' });
    expect(within(list).getAllByRole('option')).toHaveLength(3);
  });

  it('deve mostrar a tag, o apelido em destaque, o serial e o selo quando ha apelido', () => {
    // Arrange / Act
    renderList();

    // Assert
    const row = screen.getAllByRole('option')[0] as HTMLElement;
    expect(row).toHaveTextContent('PI-12 - Forno 1');
    expect(row.querySelector('strong')).toHaveTextContent('Forno 1');
    expect(row).toHaveTextContent('S-12');
    expect(row).toHaveTextContent('Ativo');
  });

  it('deve mostrar so a tag quando nao ha apelido', () => {
    // Arrange / Act
    renderList();

    // Assert
    const row = screen.getAllByRole('option')[1] as HTMLElement;
    expect(row.querySelector('strong')).toBeNull();
    expect(row).toHaveTextContent('PI-13');
  });

  it('deve escrever o nome ao lado da bolinha da cor quando renderizada', () => {
    // Arrange / Act
    renderList();

    // Assert
    const row = screen.getAllByRole('option')[0] as HTMLElement;
    expect(row.querySelector('[aria-hidden="true"]')).toHaveStyle({ backgroundColor: '#e11d48' });
    expect(row).toHaveTextContent('PI-12');
  });

  it('deve truncar a observacao em uma linha e dar o texto inteiro na dica quando ha observacao', () => {
    // Arrange / Act
    renderList();

    // Assert
    const note = screen.getByText('termopar trocado em 03/11');
    expect(note.className).toContain('truncate');
    expect(note).toHaveAttribute('title', 'termopar trocado em 03/11');
  });

  it('deve atenuar a linha e mostrar o selo Inativo quando o pirometro esta inativo', () => {
    // Arrange / Act
    renderList();

    // Assert
    const row = screen.getAllByRole('option')[2] as HTMLElement;
    expect(row.className).toContain('opacity-60');
    expect(row).toHaveTextContent('Inativo');
  });

  it('deve marcar so a linha selecionada como selecionada e atual quando ha selecao', () => {
    // Arrange / Act
    renderList('S-13');

    // Assert
    const rows = screen.getAllByRole('option');
    expect(rows.map((row) => row.getAttribute('aria-selected'))).toEqual([
      'false',
      'true',
      'false',
    ]);
    expect(rows[1]).toHaveAttribute('aria-current', 'true');
    expect(rows[0]).not.toHaveAttribute('aria-current');
  });

  it('deve destacar a linha selecionada com a barra lateral na cor do pirometro', () => {
    // Arrange / Act
    renderList('S-12');

    // Assert
    const row = screen.getAllByRole('option')[0] as HTMLElement;
    expect(row).toHaveStyle({ borderLeftColor: '#e11d48' });
    expect(row.className).toContain('bg-secondary');
  });

  it('deve deixar so a linha selecionada no ciclo de Tab quando renderizada', () => {
    // Arrange / Act
    renderList('S-13');

    // Assert
    const rows = screen.getAllByRole('option');
    expect(rows.map((row) => row.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
  });

  it('deve chamar onSelect com o serial quando a linha e clicada', () => {
    // Arrange
    const onSelect = renderList();

    // Act
    fireEvent.click(screen.getAllByRole('option')[1] as HTMLElement);

    // Assert
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('S-13');
  });

  it('deve selecionar a linha de baixo e mover o foco quando a seta para baixo e apertada', () => {
    // Arrange
    const onSelect = renderList('S-12');

    // Act
    fireEvent.keyDown(screen.getAllByRole('option')[0] as HTMLElement, { key: 'ArrowDown' });

    // Assert
    expect(onSelect).toHaveBeenCalledWith('S-13');
    expect(screen.getAllByRole('option')[1]).toHaveFocus();
  });

  it('deve selecionar a linha de cima quando a seta para cima e apertada', () => {
    // Arrange
    const onSelect = renderList('S-13');

    // Act
    fireEvent.keyDown(screen.getAllByRole('option')[1] as HTMLElement, { key: 'ArrowUp' });

    // Assert
    expect(onSelect).toHaveBeenCalledWith('S-12');
  });

  it('deve nao selecionar nada quando a seta passa do fim ou do inicio da lista', () => {
    // Arrange
    const onSelect = renderList('S-15');

    // Act
    fireEvent.keyDown(screen.getAllByRole('option')[2] as HTMLElement, { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getAllByRole('option')[0] as HTMLElement, { key: 'ArrowUp' });

    // Assert
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('deve ir ao primeiro e ao ultimo quando Home e End sao apertados', () => {
    // Arrange
    const onSelect = renderList('S-13');
    const row = screen.getAllByRole('option')[1] as HTMLElement;

    // Act
    fireEvent.keyDown(row, { key: 'Home' });
    fireEvent.keyDown(row, { key: 'End' });

    // Assert
    expect(onSelect).toHaveBeenNthCalledWith(1, 'S-12');
    expect(onSelect).toHaveBeenNthCalledWith(2, 'S-15');
  });

  it('deve selecionar a linha com foco quando Enter e apertado', () => {
    // Arrange
    const onSelect = renderList('S-12');

    // Act
    fireEvent.keyDown(screen.getAllByRole('option')[1] as HTMLElement, { key: 'Enter' });

    // Assert
    expect(onSelect).toHaveBeenCalledWith('S-13');
  });

  it('deve ignorar outras teclas quando uma tecla sem funcao e apertada', () => {
    // Arrange
    const onSelect = renderList();

    // Act
    fireEvent.keyDown(screen.getAllByRole('option')[0] as HTMLElement, { key: 'a' });

    // Assert
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('deve rolar por dentro e nao a pagina quando a lista passa da altura', () => {
    // Arrange / Act
    renderList();

    // Assert
    expect(screen.getByRole('listbox').className).toContain('overflow-y-auto');
  });

  it('deve deixar a primeira linha no ciclo de Tab quando nao ha selecao', () => {
    // Arrange / Act
    renderList(null);

    // Assert
    expect(screen.getAllByRole('option')[0]).toHaveAttribute('tabindex', '0');
  });
});
