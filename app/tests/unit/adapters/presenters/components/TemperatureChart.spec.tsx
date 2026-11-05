import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TemperatureChart } from '../../../../../adapters/presenters/components/TemperatureChart';
import type { PyrometerDto } from '../../../../../core/domain/dtos/pyrometer.dto';
import type { PyrometerSeriesDto } from '../../../../../core/domain/dtos/pyrometer-series.dto';

function buildSeries(pyrometerId: string, pyrometerName: string | null): PyrometerSeriesDto {
  return {
    pyrometerId,
    pyrometerName,
    points: [
      { measuredAt: '2026-11-04T08:00:00', temperature: 700 },
      { measuredAt: '2026-11-04T09:30:00', temperature: 720 },
    ],
  };
}

const DAY = { start: '2026-11-04T00:00:00', end: '2026-11-04T23:59:59' };

function seriesOf(points: [string, number][]): PyrometerSeriesDto[] {
  return [
    {
      pyrometerId: 'SN-1',
      pyrometerName: 'Forno 1',
      points: points.map(([measuredAt, temperature]) => ({ measuredAt, temperature })),
    },
  ];
}

function xTicks(container: HTMLElement): string[] {
  return [
    ...container.querySelectorAll(
      '.recharts-xAxis-tick-labels .recharts-cartesian-axis-tick-value',
    ),
  ].map((tick) => tick.textContent ?? '');
}

function yTicks(container: HTMLElement): number[] {
  return [
    ...container.querySelectorAll(
      '.recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value',
    ),
  ].map((tick) => Number.parseInt(tick.textContent ?? '', 10));
}

function manyPoints(count: number): [string, number][] {
  return Array.from({ length: count }, (_, index) => [
    `2026-11-04T${String(Math.floor(index / 60)).padStart(2, '0')}:${String(index % 60).padStart(2, '0')}:00`,
    1500 + (index % 40),
  ]);
}

describe('TemperatureChart', () => {
  it('deve mostrar uma entrada na legenda por pirometro quando ha duas series', () => {
    // Arrange
    const series = [buildSeries('SN-1', 'Forno 1'), buildSeries('SN-2', 'Forno 2')];

    // Act
    const { container } = render(<TemperatureChart series={series} width={800} height={400} />);

    // Assert
    expect(screen.getByText('Forno 1')).toBeInTheDocument();
    expect(screen.getByText('Forno 2')).toBeInTheDocument();
    expect(container.querySelectorAll('.recharts-legend-item')).toHaveLength(2);
  });

  it('deve usar o serial como nome quando o pirometro nao tem nome', () => {
    // Arrange
    const series = [buildSeries('SN-9', null)];

    // Act
    render(<TemperatureChart series={series} width={800} height={400} />);

    // Assert
    expect(screen.getByText('SN-9')).toBeInTheDocument();
  });

  it('deve renderizar sem quebrar quando a serie e vazia', () => {
    // Arrange
    const series: readonly PyrometerSeriesDto[] = [];

    // Act
    const { container } = render(<TemperatureChart series={series} width={800} height={400} />);

    // Assert
    expect(container.querySelectorAll('.recharts-legend-item')).toHaveLength(0);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('deve expor o rotulo acessivel quando renderizado', () => {
    // Arrange
    const series = [buildSeries('SN-1', 'Forno 1')];

    // Act
    render(<TemperatureChart series={series} width={800} height={400} />);

    // Assert
    expect(screen.getByRole('img', { name: 'Gráfico de temperaturas' })).toBeInTheDocument();
  });

  it('deve usar o apelido na legenda quando o pirometro tem apelido', () => {
    // Arrange
    const series = [buildSeries('SN-1', 'PI-12')];
    const pyrometers: PyrometerDto[] = [
      {
        id: 'SN-1',
        name: 'PI-12',
        nickname: 'Forno 2',
        color: '#e11d48',
        note: null,
        active: true,
      },
    ];

    // Act
    render(<TemperatureChart series={series} pyrometers={pyrometers} width={800} height={400} />);

    // Assert
    expect(screen.getByText('PI-12 - Forno 2')).toBeInTheDocument();
  });

  it('deve pintar a linha com a cor do pirometro quando ele esta na lista', () => {
    // Arrange
    const series = [buildSeries('SN-1', 'PI-12')];
    const pyrometers: PyrometerDto[] = [
      { id: 'SN-1', name: 'PI-12', nickname: null, color: '#e11d48', note: null, active: true },
    ];

    // Act
    const { container } = render(
      <TemperatureChart series={series} pyrometers={pyrometers} width={800} height={400} />,
    );

    // Assert
    const swatch = container.querySelector(
      '.recharts-legend-item svg [stroke="#e11d48"], .recharts-legend-item svg [fill="#e11d48"]',
    );
    expect(swatch).not.toBeNull();
  });

  it('deve usar a cor da paleta quando o pirometro nao esta na lista', () => {
    // Arrange
    const series = [buildSeries('SN-9', 'Forno 9')];

    // Act
    const { container } = render(<TemperatureChart series={series} width={800} height={400} />);

    // Assert
    expect(
      container.querySelector(
        '.recharts-legend-item [stroke="#2563eb"], .recharts-legend-item [fill="#2563eb"]',
      ),
    ).not.toBeNull();
  });

  it('deve mostrar data e hora nas marcas quando as leituras vao de um dia a outro', () => {
    // Arrange
    const series = seriesOf([
      ['2026-11-02T10:00:00', 700],
      ['2026-11-05T10:00:00', 720],
    ]);
    const period = { start: '2026-11-02T10:00:00', end: '2026-11-05T10:00:00' };

    // Act
    const { container } = render(
      <TemperatureChart series={series} period={period} width={800} height={400} />,
    );

    // Assert
    const ticks = xTicks(container);
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks.every((tick) => /^\d\d\/\d\d \d\d:\d\d$/.test(tick))).toBe(true);
  });

  it('deve mostrar so a hora nas marcas quando as leituras ficam no mesmo dia', () => {
    // Arrange
    const series = seriesOf([
      ['2026-11-04T10:00:00', 700],
      ['2026-11-04T14:00:00', 720],
    ]);

    // Act
    const { container } = render(
      <TemperatureChart series={series} period={DAY} width={800} height={400} />,
    );

    // Assert
    expect(xTicks(container)).toContain('12:00');
  });

  it('deve cobrir so a extensao das leituras no eixo de horario quando ha leituras', () => {
    // Arrange
    const series = seriesOf([
      ['2026-11-04T10:00:00', 1480],
      ['2026-11-04T10:07:00', 1600],
      ['2026-11-04T10:14:00', 1700],
    ]);

    // Act
    const { container } = render(
      <TemperatureChart series={series} period={DAY} width={800} height={400} />,
    );

    // Assert
    const ticks = xTicks(container);
    expect(ticks.length).toBeGreaterThanOrEqual(3);
    expect(ticks.every((tick) => tick >= '09:55' && tick <= '10:20')).toBe(true);
    expect(ticks).not.toContain('00:00');
  });

  it('deve nao partir de 0 no eixo de temperatura quando as leituras sao altas', () => {
    // Arrange
    const series = seriesOf([
      ['2026-11-04T10:00:00', 1480],
      ['2026-11-04T10:07:00', 1600],
      ['2026-11-04T10:14:00', 1700],
    ]);

    // Act
    const { container } = render(
      <TemperatureChart series={series} period={DAY} width={800} height={400} />,
    );

    // Assert
    const ticks = yTicks(container);
    expect(ticks.length).toBeGreaterThan(1);
    expect(Math.min(...ticks)).toBeGreaterThanOrEqual(1450);
    expect(Math.max(...ticks)).toBeLessThanOrEqual(1750);
  });

  it('deve renderizar sem quebrar e sem pontos quando o pirometro nao tem leituras', () => {
    // Arrange
    const series = seriesOf([]);

    // Act
    const { container } = render(
      <TemperatureChart series={series} period={DAY} width={800} height={400} />,
    );

    // Assert
    expect(container.querySelectorAll('.recharts-line-dot')).toHaveLength(0);
    expect(screen.getByRole('img', { name: 'Gráfico de temperaturas' })).toBeInTheDocument();
  });

  it('deve ligar duas leituras espacadas por um unico trecho quando ha horas entre elas', () => {
    // Arrange
    const series = seriesOf([
      ['2026-11-04T10:00:00', 700],
      ['2026-11-04T12:00:00', 710],
    ]);

    // Act
    const { container } = render(
      <TemperatureChart series={series} period={DAY} width={800} height={400} />,
    );

    // Assert
    const d = container.querySelector('.recharts-line-curve')?.getAttribute('d') ?? '';
    expect(d.match(/M/g)).toHaveLength(1);
    expect(d).toMatch(/L/);
    expect(d).not.toMatch(/C/);
  });

  it('deve desenhar um trecho so, sem quebra, quando ha lacuna maior que 15 minutos entre pares de leituras', () => {
    // Arrange
    const series = seriesOf([
      ['2026-11-04T10:00:00', 700],
      ['2026-11-04T10:05:00', 705],
      ['2026-11-04T12:00:00', 710],
      ['2026-11-04T12:05:00', 712],
    ]);

    // Act
    const { container } = render(
      <TemperatureChart series={series} period={DAY} width={800} height={400} />,
    );

    // Assert
    const d = container.querySelector('.recharts-line-curve')?.getAttribute('d') ?? '';
    expect(d.match(/M/g)).toHaveLength(1);
    expect(d.match(/C/g)).toHaveLength(3);
  });

  it('deve desenhar um trecho so de curvas quando as leituras estao a 5 minutos uma da outra', () => {
    // Arrange
    const series = seriesOf([
      ['2026-11-04T10:00:00', 700],
      ['2026-11-04T10:05:00', 705],
      ['2026-11-04T10:10:00', 710],
      ['2026-11-04T10:15:00', 712],
    ]);

    // Act
    const { container } = render(
      <TemperatureChart series={series} period={DAY} width={800} height={400} />,
    );

    // Assert
    const d = container.querySelector('.recharts-line-curve')?.getAttribute('d') ?? '';
    expect(d.match(/M/g)).toHaveLength(1);
    expect(d.match(/C/g)).toHaveLength(3);
  });

  it('deve mostrar um ponto pequeno por leitura mesmo quando as leituras estao a horas de distancia', () => {
    // Arrange
    const series = seriesOf([
      ['2026-11-04T10:00:00', 700],
      ['2026-11-04T12:00:00', 710],
    ]);

    // Act
    const { container } = render(
      <TemperatureChart series={series} period={DAY} width={800} height={400} />,
    );

    // Assert
    const dots = container.querySelectorAll('.recharts-line-dot');
    expect(dots).toHaveLength(2);
    dots.forEach((dot) => expect(dot.getAttribute('r')).toBe('3'));
  });

  it('deve pintar o ponto com a cor da linha quando o pirometro tem cor', () => {
    // Arrange
    const series = seriesOf([['2026-11-04T10:00:00', 700]]);
    const pyrometers: PyrometerDto[] = [
      { id: 'SN-1', name: 'Forno 1', nickname: null, color: '#e11d48', note: null, active: true },
    ];

    // Act
    const { container } = render(
      <TemperatureChart
        series={series}
        period={DAY}
        pyrometers={pyrometers}
        width={800}
        height={400}
      />,
    );

    // Assert
    const dot = container.querySelector('.recharts-line-dot');
    expect(dot?.getAttribute('fill')).toBe('#e11d48');
    expect(dot?.getAttribute('stroke')).toBe('#e11d48');
  });

  it('deve manter um ponto por leitura e uma so linha quando ha uma leitura isolada', () => {
    // Arrange
    const series = seriesOf([['2026-11-04T10:00:00', 700]]);

    // Act
    const { container } = render(
      <TemperatureChart series={series} period={DAY} width={800} height={400} />,
    );

    // Assert
    expect(container.querySelectorAll('.recharts-line-dot')).toHaveLength(1);
  });

  it('deve desenhar dez pirometros com mil pontos cada em menos de dois segundos', () => {
    // Arrange
    const series: PyrometerSeriesDto[] = Array.from({ length: 10 }, (_, index) => ({
      pyrometerId: `SN-${index}`,
      pyrometerName: `PI-${index}`,
      points: Array.from({ length: 1000 }, (_, point) => ({
        measuredAt: `2026-11-04T${String(Math.floor(point / 60) % 24).padStart(2, '0')}:${String(point % 60).padStart(2, '0')}:00`,
        temperature: 1400 + (point % 50),
      })),
    }));
    const period = { start: '2026-11-04T00:00:00', end: '2026-11-04T23:59:59' };
    const startedAt = performance.now();

    // Act
    render(<TemperatureChart series={series} period={period} width={1000} height={400} />);

    // Assert
    expect(performance.now() - startedAt).toBeLessThan(2000);
  });

  it('deve usar ponto de raio 3 quando ha ate 200 pontos visiveis', () => {
    // Arrange
    const series = seriesOf(manyPoints(200));

    // Act
    const { container } = render(
      <TemperatureChart series={series} period={DAY} width={800} height={400} />,
    );

    // Assert
    const dots = container.querySelectorAll('.recharts-line-dot');
    expect(dots).toHaveLength(200);
    expect(dots[0]?.getAttribute('r')).toBe('3');
  });

  it('deve reduzir o ponto para raio 2 e manter a linha quando ha mais de 200 pontos visiveis', () => {
    // Arrange
    const series = seriesOf(manyPoints(201));

    // Act
    const { container } = render(
      <TemperatureChart series={series} period={DAY} width={800} height={400} />,
    );

    // Assert
    expect(container.querySelector('.recharts-line-dot')?.getAttribute('r')).toBe('2');
    expect(container.querySelector('.recharts-line-curve')?.getAttribute('d')).toMatch(/C/);
  });

  it('deve contar os pontos de todas as series quando ha varios pirometros', () => {
    // Arrange
    const series = [
      ...seriesOf(manyPoints(120)),
      {
        ...seriesOf(manyPoints(120))[0],
        pyrometerId: 'SN-2',
        pyrometerName: 'Forno 2',
      } as PyrometerSeriesDto,
    ];

    // Act
    const { container } = render(
      <TemperatureChart series={series} period={DAY} width={800} height={400} />,
    );

    // Assert
    expect(container.querySelector('.recharts-line-dot')?.getAttribute('r')).toBe('2');
  });

  it('deve usar traco grosso com pontas e juncoes arredondadas quando desenha a linha', () => {
    // Arrange
    const series = seriesOf([
      ['2026-11-04T10:00:00', 700],
      ['2026-11-04T10:05:00', 720],
      ['2026-11-04T10:10:00', 710],
    ]);

    // Act
    const { container } = render(
      <TemperatureChart series={series} period={DAY} width={800} height={400} />,
    );

    // Assert
    const curve = container.querySelector('.recharts-line-curve');
    expect(curve?.getAttribute('stroke-width')).toBe('2.5');
    expect(curve?.getAttribute('stroke-linecap')).toBe('round');
    expect(curve?.getAttribute('stroke-linejoin')).toBe('round');
  });

  it('deve suavizar com curvas cubicas, passando por todas as leituras, quando ha tres ou mais leituras', () => {
    // Arrange
    const series = seriesOf([
      ['2026-11-04T10:00:00', 700],
      ['2026-11-04T10:05:00', 720],
      ['2026-11-04T10:10:00', 710],
    ]);

    // Act
    const { container } = render(
      <TemperatureChart series={series} period={DAY} width={800} height={400} />,
    );

    // Assert
    const d = container.querySelector('.recharts-line-curve')?.getAttribute('d') ?? '';
    expect(d).toMatch(/C/);
    expect(container.querySelectorAll('.recharts-line-dot')).toHaveLength(3);
  });

  it('deve nunca ultrapassar os valores medidos entre duas leituras quando a curva e suavizada', () => {
    // Arrange
    const series = seriesOf([
      ['2026-11-04T10:00:00', 1500],
      ['2026-11-04T10:05:00', 1500],
      ['2026-11-04T10:10:00', 1700],
      ['2026-11-04T10:15:00', 1700],
      ['2026-11-04T10:20:00', 1500],
      ['2026-11-04T10:25:00', 1500],
    ]);

    // Act
    const { container } = render(
      <TemperatureChart series={series} period={DAY} width={800} height={400} />,
    );

    // Assert
    const ys = [...container.querySelectorAll('.recharts-line-dot')].map((dot) =>
      Number(dot.getAttribute('cy')),
    );
    const d = container.querySelector('.recharts-line-curve')?.getAttribute('d') ?? '';
    const numbers = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
    const pathYs = numbers.filter((_, index) => index % 2 === 1);
    const epsilon = 0.01;
    expect(Math.min(...pathYs)).toBeGreaterThanOrEqual(Math.min(...ys) - epsilon);
    expect(Math.max(...pathYs)).toBeLessThanOrEqual(Math.max(...ys) + epsilon);
  });
});
