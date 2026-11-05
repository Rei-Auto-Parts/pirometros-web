import { TEXT_KEYS } from '../../../core/domain/constants/text-keys.constants';
import type { PyrometerDto } from '../../../core/domain/dtos/pyrometer.dto';
import type { PyrometerSummaryDto } from '../../../core/domain/dtos/pyrometer-summary.dto';
import { splitMinutes } from '../../../core/domain/models/duration.model';
import { displayName } from '../../../core/domain/models/pyrometer-name.model';
import { formatRegDate } from '../../../core/domain/models/reg-date.model';
import { cn } from '../../../infra/tools/cn';
import { t } from '../../../infra/tools/i18n.tool';
import { BatteryIndicator } from './BatteryIndicator';
import { SevenSegmentDisplay } from './SevenSegmentDisplay';

interface PyrometerCardProps {
  readonly pyrometer: PyrometerDto;
  readonly summary: PyrometerSummaryDto | undefined;
  readonly selected: boolean;
  readonly onSelect: () => void;
}

/** `3 min`, `10 h` ou `1 h 05 min`, seguido de "sem leitura". So informa: nao muda a aparencia do card. */
function withoutReadingText(minutesTotal: number): string {
  const { hours, minutes } = splitMinutes(minutesTotal);
  const min = t(TEXT_KEYS.unitMinutes);
  const hour = t(TEXT_KEYS.unitHours);
  let duration = `${minutes} ${min}`;
  if (hours > 0) {
    duration =
      minutes === 0
        ? `${hours} ${hour}`
        : `${hours} ${hour} ${String(minutes).padStart(2, '0')} ${min}`;
  }
  return `${duration} ${t(TEXT_KEYS.withoutReading)}`;
}

export function PyrometerCard({ pyrometer, summary, selected, onSelect }: PyrometerCardProps) {
  const name = displayName(pyrometer);
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'bg-card flex h-full w-full cursor-pointer flex-col gap-1.5 overflow-hidden rounded-lg border p-3 text-left shadow-sm',
        selected && 'ring-ring ring-2',
      )}
    >
      <span className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="size-3 shrink-0 rounded-full"
          style={{ backgroundColor: pyrometer.color }}
        />
        <span className="truncate text-sm font-medium" title={name}>
          {name}
        </span>
      </span>
      {summary === undefined ? (
        <>
          <SevenSegmentDisplay text="---" unit={t(TEXT_KEYS.temperatureUnit)} />
          <span className="text-muted-foreground text-xs">{t(TEXT_KEYS.noSummary)}</span>
        </>
      ) : (
        <>
          <SevenSegmentDisplay
            text={String(summary.temperature)}
            label={`${summary.temperature} ${t(TEXT_KEYS.temperatureUnit)}`}
            unit={t(TEXT_KEYS.temperatureUnit)}
          />
          <span className="text-muted-foreground text-xs">{formatRegDate(summary.measuredAt)}</span>
          <BatteryIndicator battery={summary.battery} />
          <span className="text-xs">{withoutReadingText(summary.minutesWithoutReading)}</span>
        </>
      )}
    </button>
  );
}
