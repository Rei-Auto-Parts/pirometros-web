import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ColorPicker } from '../../../../../adapters/presenters/components/ColorPicker';

describe('ColorPicker', () => {
  afterEach(() => cleanup());

  it('deve oferecer exatamente 12 cores quando renderizado', () => {
    // Arrange / Act
    render(<ColorPicker value="#2563eb" onChange={vi.fn()} />);

    // Assert
    expect(screen.getAllByRole('radio')).toHaveLength(12);
  });

  it('deve nomear cada cor em portugues quando renderizado', () => {
    // Arrange / Act
    render(<ColorPicker value="#2563eb" onChange={vi.fn()} />);

    // Assert
    expect(screen.getByRole('radio', { name: 'Azul' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Vermelho' })).toBeInTheDocument();
  });

  it('deve marcar so a cor atual quando ela esta na paleta', () => {
    // Arrange / Act
    render(<ColorPicker value="#dc2626" onChange={vi.fn()} />);

    // Assert
    const checked = screen.getAllByRole('radio', { checked: true });
    expect(checked).toHaveLength(1);
    expect(checked[0]).toHaveAccessibleName('Vermelho');
  });

  it('deve nao marcar nenhuma cor quando a atual esta fora da paleta', () => {
    // Arrange / Act
    render(<ColorPicker value="#123456" onChange={vi.fn()} />);

    // Assert
    expect(screen.queryAllByRole('radio', { checked: true })).toHaveLength(0);
  });

  it('deve chamar onChange com o valor da cor quando uma cor e escolhida', () => {
    // Arrange
    const onChange = vi.fn<(color: string) => void>();
    render(<ColorPicker value="#2563eb" onChange={onChange} />);

    // Act
    fireEvent.click(screen.getByRole('radio', { name: 'Verde' }));

    // Assert
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('#16a34a');
  });

  it('deve nao oferecer seletor livre de cor quando renderizado', () => {
    // Arrange / Act
    const { container } = render(<ColorPicker value="#2563eb" onChange={vi.fn()} />);

    // Assert
    expect(container.querySelector('input[type="color"]')).toBeNull();
  });

  it('deve desabilitar a cor usada por outro pirometro e dizer quem a usa quando ha cor em uso', () => {
    // Arrange
    const inUse = new Map([['#dc2626', 'PI-13']]);

    // Act
    render(<ColorPicker value="#2563eb" onChange={vi.fn()} inUse={inUse} />);

    // Assert
    const radio = screen.getByRole('radio', { name: 'Vermelho (em uso por PI-13)' });
    expect(radio).toBeDisabled();
    expect(radio).toHaveAttribute('title', 'Vermelho (em uso por PI-13)');
  });

  it('deve manter as demais cores habilitadas quando so uma esta em uso', () => {
    // Arrange
    const inUse = new Map([['#dc2626', 'PI-13']]);

    // Act
    render(<ColorPicker value="#2563eb" onChange={vi.fn()} inUse={inUse} />);

    // Assert
    expect(
      screen.getAllByRole('radio').filter((radio) => !(radio as HTMLButtonElement).disabled),
    ).toHaveLength(11);
  });

  it('deve manter a cor atual do proprio pirometro selecionavel quando ela nao esta no mapa de uso', () => {
    // Arrange
    const inUse = new Map([['#dc2626', 'PI-13']]);

    // Act
    render(<ColorPicker value="#2563eb" onChange={vi.fn()} inUse={inUse} />);

    // Assert
    expect(screen.getByRole('radio', { name: 'Azul', checked: true })).toBeEnabled();
  });

  it('deve nao chamar onChange quando a cor em uso e clicada', () => {
    // Arrange
    const onChange = vi.fn<(color: string) => void>();
    render(
      <ColorPicker value="#2563eb" onChange={onChange} inUse={new Map([['#dc2626', 'PI-13']])} />,
    );

    // Act
    fireEvent.click(screen.getByRole('radio', { name: 'Vermelho (em uso por PI-13)' }));

    // Assert
    expect(onChange).not.toHaveBeenCalled();
  });

  it('deve comparar a cor em uso sem diferenciar maiuscula quando o mapa vem em minuscula', () => {
    // Arrange / Act
    render(
      <ColorPicker value="#2563EB" onChange={vi.fn()} inUse={new Map([['#16a34a', 'PI-14']])} />,
    );

    // Assert
    expect(screen.getByRole('radio', { name: 'Verde (em uso por PI-14)' })).toBeDisabled();
  });

  it('deve organizar as cores em grade de 6 por linha quando renderizado', () => {
    // Arrange / Act
    render(<ColorPicker value="#2563eb" onChange={vi.fn()} />);

    // Assert
    expect(screen.getByRole('radiogroup').className).toContain('grid-cols-6');
  });

  it('deve marcar so a cor escolhida com o sinal de escolhido quando renderizado', () => {
    // Arrange / Act
    render(<ColorPicker value="#16a34a" onChange={vi.fn()} />);

    // Assert
    const withMark = screen
      .getAllByRole('radio')
      .filter((radio) => radio.querySelector('svg') !== null);
    expect(withMark).toHaveLength(1);
    expect(withMark[0]).toHaveAccessibleName('Verde');
  });

  it('deve mostrar o nome e o codigo da cor escolhida em texto quando ela esta na paleta', () => {
    // Arrange / Act
    render(<ColorPicker value="#2563eb" onChange={vi.fn()} />);

    // Assert
    expect(screen.getByText('Azul · #2563eb')).toBeInTheDocument();
  });

  it('deve mostrar so o codigo quando a cor escolhida esta fora da paleta', () => {
    // Arrange / Act
    render(<ColorPicker value="#123456" onChange={vi.fn()} />);

    // Assert
    expect(screen.getByText('#123456')).toBeInTheDocument();
  });

  it('deve riscar a cor em uso por outro pirometro quando ha cor em uso', () => {
    // Arrange / Act
    render(
      <ColorPicker value="#2563eb" onChange={vi.fn()} inUse={new Map([['#dc2626', 'PI-13']])} />,
    );

    // Assert
    const used = screen.getByRole('radio', { name: 'Vermelho (em uso por PI-13)' });
    expect(used.querySelector('[data-strike]')).not.toBeNull();
    expect(screen.getByRole('radio', { name: 'Azul' }).querySelector('[data-strike]')).toBeNull();
  });

  it('deve deixar so a cor escolhida no ciclo de Tab quando renderizado', () => {
    // Arrange / Act
    render(<ColorPicker value="#16a34a" onChange={vi.fn()} />);

    // Assert
    const tabbable = screen
      .getAllByRole('radio')
      .filter((radio) => radio.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAccessibleName('Verde');
  });

  it('deve escolher a proxima cor quando a seta para a direita e apertada', () => {
    // Arrange
    const onChange = vi.fn<(color: string) => void>();
    render(<ColorPicker value="#2563eb" onChange={onChange} />);

    // Act
    fireEvent.keyDown(screen.getByRole('radio', { name: 'Azul' }), { key: 'ArrowRight' });

    // Assert
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('#dc2626');
  });

  it('deve escolher a cor anterior quando a seta para a esquerda e apertada', () => {
    // Arrange
    const onChange = vi.fn<(color: string) => void>();
    render(<ColorPicker value="#dc2626" onChange={onChange} />);

    // Act
    fireEvent.keyDown(screen.getByRole('radio', { name: 'Vermelho' }), { key: 'ArrowLeft' });

    // Assert
    expect(onChange).toHaveBeenCalledWith('#2563eb');
  });

  it('deve voltar do inicio ao fim da paleta quando a seta para a esquerda passa da primeira cor', () => {
    // Arrange
    const onChange = vi.fn<(color: string) => void>();
    render(<ColorPicker value="#2563eb" onChange={onChange} />);

    // Act
    fireEvent.keyDown(screen.getByRole('radio', { name: 'Azul' }), { key: 'ArrowLeft' });

    // Assert
    expect(onChange).toHaveBeenCalledWith('#78716c');
  });

  it('deve pular a cor em uso quando a seta cai numa cor desabilitada', () => {
    // Arrange
    const onChange = vi.fn<(color: string) => void>();
    render(
      <ColorPicker value="#2563eb" onChange={onChange} inUse={new Map([['#dc2626', 'PI-13']])} />,
    );

    // Act
    fireEvent.keyDown(screen.getByRole('radio', { name: 'Azul' }), { key: 'ArrowRight' });

    // Assert
    expect(onChange).toHaveBeenCalledWith('#16a34a');
  });

  it('deve mover o foco para a cor escolhida quando a seta e apertada', () => {
    // Arrange
    render(<ColorPicker value="#2563eb" onChange={vi.fn()} />);

    // Act
    fireEvent.keyDown(screen.getByRole('radio', { name: 'Azul' }), { key: 'ArrowDown' });

    // Assert
    expect(screen.getByRole('radio', { name: 'Vermelho' })).toHaveFocus();
  });

  it('deve ignorar outras teclas quando uma tecla sem funcao e apertada', () => {
    // Arrange
    const onChange = vi.fn<(color: string) => void>();
    render(<ColorPicker value="#2563eb" onChange={onChange} />);

    // Act
    fireEvent.keyDown(screen.getByRole('radio', { name: 'Azul' }), { key: 'a' });

    // Assert
    expect(onChange).not.toHaveBeenCalled();
  });
});
