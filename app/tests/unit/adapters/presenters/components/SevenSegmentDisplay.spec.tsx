import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SevenSegmentDisplay } from '../../../../../adapters/presenters/components/SevenSegmentDisplay';

function litSegments(container: HTMLElement, cell: number): string {
  const group = container.querySelectorAll('[data-char]')[cell];
  return [...(group?.querySelectorAll('[data-lit="true"]') ?? [])]
    .map((segment) => segment.getAttribute('data-segment'))
    .join('');
}

function renderDisplay(text: string, label = 'x') {
  return render(<SevenSegmentDisplay text={text} label={label} unit="°C" />);
}

describe('SevenSegmentDisplay', () => {
  afterEach(() => cleanup());

  it.each([
    ['0', 'abcdef'],
    ['1', 'bc'],
    ['2', 'abdeg'],
    ['3', 'abcdg'],
    ['4', 'bcfg'],
    ['5', 'acdfg'],
    ['6', 'acdefg'],
    ['7', 'abc'],
    ['8', 'abcdefg'],
    ['9', 'abcdfg'],
    ['-', 'g'],
    [' ', ''],
  ])('deve acender os segmentos de "%s" como "%s" quando o caractere e desenhado', (char, lit) => {
    // Arrange
    const { container } = renderDisplay(char.padStart(4, ' '));

    // Act
    const segments = litSegments(container, 3);

    // Assert
    expect(segments).toBe(lit);
  });

  it('deve desenhar sete segmentos por celula, acesos ou apagados, quando renderizado', () => {
    // Arrange / Act
    const { container } = renderDisplay('1510');

    // Assert
    const cells = container.querySelectorAll('[data-char]');
    expect(cells).toHaveLength(4);
    cells.forEach((cell) => expect(cell.querySelectorAll('[data-segment]')).toHaveLength(7));
  });

  it('deve ler 1510 celula a celula quando o texto e 1510', () => {
    // Arrange / Act
    const { container } = renderDisplay('1510');

    // Assert
    expect([0, 1, 2, 3].map((cell) => litSegments(container, cell))).toEqual([
      'bc',
      'acdfg',
      'bc',
      'abcdef',
    ]);
  });

  it('deve completar com celulas apagadas a esquerda quando o texto tem menos de 4 caracteres', () => {
    // Arrange / Act
    const { container } = renderDisplay('63');

    // Assert
    expect(container.querySelectorAll('[data-char]')).toHaveLength(4);
    expect([0, 1].map((cell) => litSegments(container, cell))).toEqual(['', '']);
    expect([2, 3].map((cell) => litSegments(container, cell))).toEqual(['acdefg', 'abcdg']);
  });

  it('deve crescer quando o texto tem mais de 4 caracteres', () => {
    // Arrange / Act
    const { container } = renderDisplay('12345');

    // Assert
    expect(container.querySelectorAll('[data-char]')).toHaveLength(5);
  });

  it('deve mostrar tres tracos alinhados a direita quando o texto e ---', () => {
    // Arrange / Act
    const { container } = renderDisplay('---');

    // Assert
    expect([0, 1, 2, 3].map((cell) => litSegments(container, cell))).toEqual(['', 'g', 'g', 'g']);
  });

  it('deve tratar caractere desconhecido como celula apagada quando o texto tem letra', () => {
    // Arrange / Act
    const { container } = renderDisplay('12A4');

    // Assert
    expect(litSegments(container, 2)).toBe('');
  });

  it('deve expor o valor real em texto para leitor de tela quando renderizado', () => {
    // Arrange / Act
    const { container } = renderDisplay('1510', '1510 °C');

    // Assert
    const text = container.querySelector('.sr-only');
    expect(text).toHaveTextContent('1510 °C');
  });

  it('deve esconder o desenho dos leitores de tela quando renderizado', () => {
    // Arrange / Act
    const { container } = renderDisplay('1510');

    // Assert
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('deve mostrar a unidade ao lado do display quando ela e informada', () => {
    // Arrange / Act
    const { container } = renderDisplay('1510');

    // Assert
    expect(container).toHaveTextContent('°C');
  });

  it('deve usar o painel escuro com digitos vermelhos de LED nos dois temas quando renderizado', () => {
    // Arrange / Act
    const { container } = renderDisplay('1510');

    // Assert
    const panel = container.firstElementChild as HTMLElement;
    expect(panel.className).toContain('bg-neutral-900');
    expect(panel.className).toContain('text-red-500');
    expect(panel.className).not.toMatch(/amber|green|yellow/);
    expect(panel.className).not.toContain('dark:');
  });

  it('deve apagar os segmentos desligados com opacidade baixa quando renderizado', () => {
    // Arrange / Act
    const { container } = renderDisplay('1');

    // Assert
    const off = container.querySelector('[data-lit="false"]');
    expect(off?.getAttribute('class')).toContain('opacity-');
  });

  it('deve ser cerca de 33% maior que o tamanho anterior quando renderizado', () => {
    // Arrange / Act
    const { container } = renderDisplay('1510');

    // Assert
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('h-8');
    expect(svg?.getAttribute('class')).not.toContain('h-6');
  });

  it('deve apagar os segmentos desligados com o mesmo vermelho, so mais tenue, quando renderizado', () => {
    // Arrange / Act
    const { container } = renderDisplay('1');

    // Assert
    const off = container.querySelector('[data-lit="false"]');
    const on = container.querySelector('[data-lit="true"]');
    expect(off?.getAttribute('fill')).toBe('currentColor');
    expect(on?.getAttribute('fill')).toBe('currentColor');
    expect(off?.getAttribute('class')).toContain('opacity-15');
    expect(on?.getAttribute('class') ?? '').not.toContain('opacity-');
  });

  it('deve manter a mesma cor do painel quando o texto muda', () => {
    // Arrange
    const first = renderDisplay('1');
    const firstClass = (first.container.firstElementChild as HTMLElement).className;
    cleanup();

    // Act
    const second = renderDisplay('5000');

    // Assert
    expect((second.container.firstElementChild as HTMLElement).className).toBe(firstClass);
  });
});
