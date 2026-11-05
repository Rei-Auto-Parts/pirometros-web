import { TEXT_KEYS, type TextKey } from './text-keys.constants';

export type ChartPeriodKey = 'hour' | 'sixHours' | 'day' | 'today' | 'threeDays';

export interface ChartPeriodOption {
  readonly key: ChartPeriodKey;
  readonly labelKey: TextKey;
}

export const CHART_PERIODS: readonly ChartPeriodOption[] = [
  { key: 'hour', labelKey: TEXT_KEYS.periodHour },
  { key: 'sixHours', labelKey: TEXT_KEYS.periodSixHours },
  { key: 'day', labelKey: TEXT_KEYS.periodDay },
  { key: 'today', labelKey: TEXT_KEYS.periodToday },
  { key: 'threeDays', labelKey: TEXT_KEYS.periodThreeDays },
];

export const DEFAULT_CHART_PERIOD: ChartPeriodKey = 'today';
