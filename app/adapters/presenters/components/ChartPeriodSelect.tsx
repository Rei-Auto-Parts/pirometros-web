import {
  CHART_PERIODS,
  type ChartPeriodKey,
} from '../../../core/domain/constants/chart-periods.constants';
import { TEXT_KEYS } from '../../../core/domain/constants/text-keys.constants';
import { t } from '../../../infra/tools/i18n.tool';
import { Button } from '../ui/button';

interface ChartPeriodSelectProps {
  readonly value: ChartPeriodKey;
  readonly onChange: (period: ChartPeriodKey) => void;
}

export function ChartPeriodSelect({ value, onChange }: ChartPeriodSelectProps) {
  return (
    <div role="group" aria-label={t(TEXT_KEYS.chartPeriodLabel)} className="flex flex-wrap gap-2">
      {CHART_PERIODS.map((period) => (
        <Button
          key={period.key}
          type="button"
          variant={period.key === value ? 'default' : 'outline'}
          aria-pressed={period.key === value}
          onClick={() => onChange(period.key)}
        >
          {t(period.labelKey)}
        </Button>
      ))}
    </div>
  );
}
