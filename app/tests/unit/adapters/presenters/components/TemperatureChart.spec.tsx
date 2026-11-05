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

  it('deve renderizar o periodo de tres dias com data nas marcas quando o periodo cruza dias', () => {
    // Arrange
    const series = [buildSeries('SN-1', 'Forno 1')];
    const period = { start: '2026-11-02T10:00:00', end: '2026-11-05T10:00:00' };

    // Act
    const { container } = render(
      <TemperatureChart series={series} period={period} width={800} height={400} />,
    );

    // Assert
    const ticks = [
      ...container.querySelectorAll(
        '.recharts-xAxis-tick-labels .recharts-cartesian-axis-tick-value',
      ),
    ];
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks.every((tick) => /^\d\d\/\d\d \d\d:\d\d$/.test(tick.textContent ?? ''))).toBe(true);
  });

  it('deve mostrar so a hora nas marcas quando o periodo e de um dia', () => {
    // Arrange
    const series = [buildSeries('SN-1', 'Forno 1')];
    const period = { start: '2026-11-04T00:00:00', end: '2026-11-04T23:59:59' };

    // Act
    const { container } = render(
      <TemperatureChart series={series} period={period} width={800} height={400} />,
    );

    // Assert
    const ticks = [
      ...container.querySelectorAll(
        '.recharts-xAxis-tick-labels .recharts-cartesian-axis-tick-value',
      ),
    ];
    expect(ticks.map((tick) => tick.textContent)).toContain('12:00');
  });

  it('deve ligar duas leituras espacadas por uma unica reta quando ha horas entre elas', () => {
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
    expect(d.match(/L/g)).toHaveLength(3);
  });

  it('deve desenhar um trecho so de retas quando as leituras estao a 5 minutos uma da outra', () => {
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
    expect(d).not.toMatch(/C/);
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
});
