import { useMemo } from 'react';
import { Line, LineChart, XAxis, YAxis } from 'recharts';
import type { SeriesPointDto } from '../../../core/domain/dtos/pyrometer-series.dto';
import { toChartPoints } from '../../../core/domain/models/series-gap.model';

interface SparklineProps {
  readonly points: readonly SeriesPointDto[];
  readonly color: string;
  readonly label: string;
  readonly width?: number;
  readonly height?: number;
}

const DEFAULT_WIDTH = 160;
const DEFAULT_HEIGHT = 36;

/** Miniatura das temperaturas, sem eixos; a lacuna interrompe a linha como no grafico grande. */
export function Sparkline({
  points,
  color,
  label,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
}: SparklineProps) {
  const data = useMemo(() => toChartPoints(points), [points]);
  return (
    <div role="img" aria-label={label} style={{ width, height }}>
      <LineChart width={width} height={height} data={data}>
        <XAxis type="number" dataKey="x" hide domain={['dataMin', 'dataMax']} />
        <YAxis hide domain={['auto', 'auto']} />
        <Line
          dataKey="temperature"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </div>
  );
}
