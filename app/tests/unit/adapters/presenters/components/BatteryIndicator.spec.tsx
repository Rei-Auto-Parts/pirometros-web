import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BatteryIndicator } from '../../../../../adapters/presenters/components/BatteryIndicator';

const bar = (container: HTMLElement): HTMLElement | null =>
  container.querySelector('[data-battery-bar]');

describe('BatteryIndicator', () => {
  afterEach(() => cleanup());

  it('deve mostrar a bateria como porcentagem quando ha valor', () => {
    // Arrange / Act
    const { container } = render(<BatteryIndicator battery={63} />);

    // Assert
    expect(container).toHaveTextContent('Bateria 63%');
  });

  it('deve preencher a barra na proporcao do valor quando ha valor', () => {
    // Arrange / Act
    const { container } = render(<BatteryIndicator battery={63} />);

    // Assert
    expect(bar(container)).toHaveStyle({ width: '63%' });
  });

  it('deve limitar a barra a 100% e mostrar o valor real quando passa de 100', () => {
    // Arrange / Act
    const { container } = render(<BatteryIndicator battery={130} />);

    // Assert
    expect(bar(container)).toHaveStyle({ width: '100%' });
    expect(container).toHaveTextContent('Bateria 130%');
  });

  it('deve limitar a barra a 0% quando o valor e negativo', () => {
    // Arrange / Act
    const { container } = render(<BatteryIndicator battery={-5} />);

    // Assert
    expect(bar(container)).toHaveStyle({ width: '0%' });
  });

  it('deve mostrar a barra vazia quando o valor e zero', () => {
    // Arrange / Act
    const { container } = render(<BatteryIndicator battery={0} />);

    // Assert
    expect(bar(container)).toHaveStyle({ width: '0%' });
    expect(container).toHaveTextContent('Bateria 0%');
  });

  it('deve mostrar o vazio padrao e nenhuma barra quando o valor e nulo', () => {
    // Arrange / Act
    const { container } = render(<BatteryIndicator battery={null} />);

    // Assert
    expect(container).toHaveTextContent('Bateria —');
    expect(bar(container)).toBeNull();
  });

  it('deve usar a mesma cor neutra e nenhum alerta quando a bateria e muito baixa', () => {
    // Arrange
    const { container: full } = render(<BatteryIndicator battery={95} />);
    const fullClass = bar(full)?.className;
    cleanup();

    // Act
    const { container: low } = render(<BatteryIndicator battery={3} />);

    // Assert
    expect(bar(low)?.className).toBe(fullClass);
    expect(bar(low)?.className).toContain('bg-primary');
    expect(low.querySelector('[role="alert"]')).toBeNull();
    expect(bar(low)?.className).not.toMatch(/red|amber|destructive/);
  });

  it('deve esconder a barra dos leitores de tela quando ela e desenhada', () => {
    // Arrange / Act
    const { container } = render(<BatteryIndicator battery={63} />);

    // Assert
    expect(bar(container)?.parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('deve usar uma barra fina quando desenhada', () => {
    // Arrange / Act
    const { container } = render(<BatteryIndicator battery={63} />);

    // Assert
    expect(bar(container)?.parentElement?.className).toContain('h-1');
  });
});
