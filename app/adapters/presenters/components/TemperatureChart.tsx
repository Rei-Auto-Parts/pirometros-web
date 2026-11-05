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
import { getChartPeriod } from '../../../core/domain/models/chart-period.model';
import { findPyrometer, resolveName } from '../../../core/domain/models/pyrometer-name.model';
import { formatEpoch } from '../../../core/domain/models/reg-date.model';
import { toChartPoints, type ChartPoint } from '../../../core/domain/models/series-points.model';
import { t } from '../../../infra/tools/i18n.tool';

const DEFAULT_HEIGHT = 420;

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
        type="linear"
        stroke={color}
        dot={{ r: 3, fill: color, stroke: color }}
        activeDot={{ r: 5, fill: color, stroke: color }}
        isAnimationActive={false}
      />
    );
  });
}

function renderChart(
  lines: readonly ChartLine[],
  pyrometers: readonly PyrometerDto[],
  axis: ChartAxis,
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
      <YAxis unit={` ${t(TEXT_KEYS.temperatureUnit)}`} name={t(TEXT_KEYS.temperatureLabel)} />
      <Tooltip labelFormatter={(label) => formatEpoch(Number(label), axis.withDate)} />
      <Legend />
      {renderLines(lines, pyrometers)}
    </LineChart>
  );
}

export function TemperatureChart({
  series,
  period,
  pyrometers = [],
  width,
  height,
}: TemperatureChartProps): ReactElement {
  const axis = useMemo(() => buildChartAxis(period ?? getChartPeriod('today')), [period]);
  // Referencias estaveis: o Recharts re-registra a serie sempre que o `data` muda de referencia.
  const lines = useMemo(
    () => series.map((item) => ({ item, data: toChartPoints(item.points) })),
    [series],
  );
  const fixedSize = width !== undefined && height !== undefined;
  return (
    <div role="img" aria-label={t(TEXT_KEYS.chartLabel)}>
      {fixedSize ? (
        renderChart(lines, pyrometers, axis, width, height)
      ) : (
        <ResponsiveContainer width="100%" height={DEFAULT_HEIGHT}>
          {renderChart(lines, pyrometers, axis)}
        </ResponsiveContainer>
      )}
    </div>
  );
}
