import { useMemo, type ReactElement } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PYROMETER_PALETTE } from '../../../core/domain/constants/pyrometer-profile.constants';
import { TEXT_KEYS } from '../../../core/domain/constants/text-keys.constants';
import type { PyrometerDto } from '../../../core/domain/dtos/pyrometer.dto';
import type { PyrometerSeriesDto } from '../../../core/domain/dtos/pyrometer-series.dto';
import type { ReadingPeriodDto } from '../../../core/domain/dtos/reading-period.dto';
import { buildChartAxis, type ChartAxis } from '../../../core/domain/models/chart-axis.model';
import { buildValueAxis } from '../../../core/domain/models/value-axis.model';
import { getChartPeriod } from '../../../core/domain/models/chart-period.model';
import { findPyrometer, resolveName } from '../../../core/domain/models/pyrometer-name.model';
import { formatEpoch } from '../../../core/domain/models/reg-date.model';
import { toChartPoints, type ChartPoint } from '../../../core/domain/models/series-points.model';
import { t } from '../../../infra/tools/i18n.tool';

const DEFAULT_HEIGHT = 420;
/** Acima disto, o ponto encolhe (raio 2) para nao virar uma mancha; a linha continua visivel. */
const MANY_POINTS = 200;
/**
 * Acima disto (pontos visiveis, somando as series) nao se desenha ponto algum: um `<circle>` por leitura
 * pesa no desenho e vira mancha. A linha suave e o ponto ativo (ao passar o mouse) continuam.
 */
const MAX_DOT_POINTS = 500;
const DOT_RADIUS = 3;
const DOT_RADIUS_DENSE = 2;
const ACTIVE_DOT_RADIUS = 5;

interface TemperatureChartProps {
  readonly series: readonly PyrometerSeriesDto[];
  /** Janela do eixo de tempo; sem ela, o dia de hoje. */
  readonly period?: ReadingPeriodDto;
  /** Da o nome mostrado e a cor de cada linha; sem correspondencia, nome da serie e cor da paleta. */
  readonly pyrometers?: readonly PyrometerDto[];
  readonly width?: number;
  readonly height?: number;
}

interface ChartLine {
  readonly item: PyrometerSeriesDto;
  readonly data: ChartPoint[];
}

function renderLines(
  lines: readonly ChartLine[],
  pyrometers: readonly PyrometerDto[],
  radius: number | null,
): ReactElement[] {
  return lines.map(({ item, data }, index) => {
    const color =
      findPyrometer(pyrometers, item.pyrometerId)?.color ??
      PYROMETER_PALETTE[index % PYROMETER_PALETTE.length]?.value;
    return (
      <Line
        key={item.pyrometerId ?? `series-${index}`}
        data={data}
        dataKey="temperature"
        name={resolveName(pyrometers, item.pyrometerId, item.pyrometerName)}
        type="monotone"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={color}
        dot={radius === null ? false : { r: radius, fill: color, stroke: color }}
        activeDot={{ r: ACTIVE_DOT_RADIUS, fill: color, stroke: color }}
        isAnimationActive={false}
      />
    );
  });
}

function renderChart(
  lines: readonly ChartLine[],
  pyrometers: readonly PyrometerDto[],
  axis: ChartAxis,
  valueDomain: readonly [number, number] | null,
  radius: number | null,
  width?: number,
  height?: number,
): ReactElement {
  return (
    <LineChart width={width} height={height}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        type="number"
        dataKey="x"
        domain={[...axis.domain]}
        ticks={[...axis.ticks]}
        tickFormatter={(value: number) => formatEpoch(value, axis.withDate)}
      />
      <YAxis
        unit={` ${t(TEXT_KEYS.temperatureUnit)}`}
        name={t(TEXT_KEYS.temperatureLabel)}
        domain={valueDomain === null ? undefined : [...valueDomain]}
        allowDecimals={false}
      />
      <Tooltip labelFormatter={(label) => formatEpoch(Number(label), axis.withDate)} />
      <Legend />
      {renderLines(lines, pyrometers, radius)}
    </LineChart>
  );
}

/** Raio do ponto conforme quantos pontos estao visiveis; `null` = sem pontos (so a linha). */
function dotRadius(visiblePoints: number): number | null {
  if (visiblePoints > MAX_DOT_POINTS) return null;
  return visiblePoints > MANY_POINTS ? DOT_RADIUS_DENSE : DOT_RADIUS;
}

export function TemperatureChart({
  series,
  period,
  pyrometers = [],
  width,
  height,
}: TemperatureChartProps): ReactElement {
  // Referencias estaveis: o Recharts re-registra a serie sempre que o `data` muda de referencia.
  const lines = useMemo(
    () => series.map((item) => ({ item, data: toChartPoints(item.points) })),
    [series],
  );
  // Os eixos acompanham o que esta exibido; o periodo so entra quando nao ha leituras.
  const { axis, valueDomain, radius } = useMemo(() => {
    const points = lines.flatMap((line) => line.data);
    const extent =
      points.length === 0
        ? null
        : {
            min: Math.min(...points.map((point) => point.x)),
            max: Math.max(...points.map((point) => point.x)),
          };
    return {
      axis: buildChartAxis(period ?? getChartPeriod('today'), extent),
      valueDomain: buildValueAxis(points.map((point) => point.temperature)),
      radius: dotRadius(points.length),
    };
  }, [lines, period]);
  const fixedSize = width !== undefined && height !== undefined;
  return (
    <div role="img" aria-label={t(TEXT_KEYS.chartLabel)}>
      {fixedSize ? (
        renderChart(lines, pyrometers, axis, valueDomain, radius, width, height)
      ) : (
        <ResponsiveContainer width="100%" height={DEFAULT_HEIGHT}>
          {renderChart(lines, pyrometers, axis, valueDomain, radius)}
        </ResponsiveContainer>
      )}
    </div>
  );
}
