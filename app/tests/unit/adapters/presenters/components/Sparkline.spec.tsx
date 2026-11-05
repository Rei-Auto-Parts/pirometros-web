import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Sparkline } from '../../../../../adapters/presenters/components/Sparkline';

const POINTS = [
  { measuredAt: '2026-11-05T10:00:00', temperature: 1500 },
  { measuredAt: '2026-11-05T10:05:00', temperature: 1510 },
];

describe('Sparkline', () => {
  afterEach(() => cleanup());

  it('deve expor o rotulo acessivel quando renderizado', () => {
    // Arrange / Act
    render(<Sparkline points={POINTS} color="#2563eb" label="Ultima hora: Forno 2" />);

    // Assert
    expect(screen.getByRole('img', { name: 'Ultima hora: Forno 2' })).toBeInTheDocument();
  });

  it('deve desenhar um grafico sem eixos visiveis quando ha pontos', () => {
    // Arrange / Act
    const { container } = render(
      <Sparkline points={POINTS} color="#2563eb" label="x" width={160} height={36} />,
    );

    // Assert
    expect(container.querySelector('.recharts-wrapper')).not.toBeNull();
    expect(container.querySelector('.recharts-xAxis')).toBeNull();
  });

  it('deve renderizar sem quebrar quando nao ha pontos', () => {
    // Arrange / Act
    render(<Sparkline points={[]} color="#2563eb" label="vazio" />);

    // Assert
    expect(screen.getByRole('img', { name: 'vazio' })).toBeInTheDocument();
  });

  it('deve usar o tamanho informado quando largura e altura sao passadas', () => {
    // Arrange / Act
    render(<Sparkline points={POINTS} color="#2563eb" label="x" width={100} height={20} />);

    // Assert
    expect(screen.getByRole('img')).toHaveStyle({ width: '100px', height: '20px' });
  });
});
