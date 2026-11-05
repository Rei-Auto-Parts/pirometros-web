import { useMemo, useState } from 'react';

import {
  DEFAULT_CHART_PERIOD,
  type ChartPeriodKey,
} from '../../../core/domain/constants/chart-periods.constants';
import { TEXT_KEYS } from '../../../core/domain/constants/text-keys.constants';
import { getChartPeriod } from '../../../core/domain/models/chart-period.model';
import { onlyActive, sortByDisplayName } from '../../../core/domain/models/pyrometer-name.model';
import { t } from '../../../infra/tools/i18n.tool';
import { ChartPeriodSelect } from '../components/ChartPeriodSelect';
import { PyrometerCards } from '../components/PyrometerCards';
import { PyrometerFilter } from '../components/PyrometerFilter';
import { StateMessage } from '../components/StateMessage';
import { TemperatureChart } from '../components/TemperatureChart';
import { usePyrometerSummaries } from '../hooks/usePyrometerSummaries';
import { usePyrometers } from '../hooks/usePyrometers';
import { useReadingsSeries } from '../hooks/useReadingsSeries';

export function MonitoringPage() {
  const [pyrometerId, setPyrometerId] = useState<string | null>(null);
  const [periodKey, setPeriodKey] = useState<ChartPeriodKey>(DEFAULT_CHART_PERIOD);
  const pyrometers = usePyrometers();
  const summaries = usePyrometerSummaries();
  const series = useReadingsSeries(pyrometerId, periodKey);
  const lastHour = useReadingsSeries(null, 'hour');
  // O eixo acompanha a janela consultada: ancorado no instante da ultima busca, nao a cada render.
  const fetchedAt = series.dataUpdatedAt;
  const period = useMemo(
    () => getChartPeriod(periodKey, fetchedAt === 0 ? new Date() : new Date(fetchedAt)),
    [periodKey, fetchedAt],
  );

  const all = useMemo(() => pyrometers.data ?? [], [pyrometers.data]);
  const active = sortByDisplayName(onlyActive(all));
  // Referencia estavel: o grafico so redesenha quando a serie ou os pirometros mudam.
  const visibleSeries = useMemo(() => {
    const inactiveIds = new Set(
      (pyrometers.data ?? []).filter((item) => !item.active).map((item) => item.id),
    );
    return (series.data ?? []).filter(
      (item) => item.pyrometerId === null || !inactiveIds.has(item.pyrometerId),
    );
  }, [series.data, pyrometers.data]);
  const failed = [pyrometers, summaries, series, lastHour].some((query) => query.isError);
  const retry = (): void => {
    void Promise.all([
      pyrometers.refetch(),
      summaries.refetch(),
      series.refetch(),
      lastHour.refetch(),
    ]);
  };
  const noop = (): void => undefined;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">{t(TEXT_KEYS.monitoringTitle)}</h1>
        <p className="text-muted-foreground">{t(TEXT_KEYS.monitoringDescription)}</p>
      </header>
      {pyrometers.data !== undefined && summaries.data !== undefined && active.length > 0 && (
        <PyrometerCards
          pyrometers={pyrometers.data}
          summaries={summaries.data}
          series={lastHour.data ?? []}
          selectedId={pyrometerId}
          onSelect={setPyrometerId}
        />
      )}
      <div className="flex flex-wrap items-end gap-4">
        <PyrometerFilter pyrometers={active} value={pyrometerId} onChange={setPyrometerId} />
        <ChartPeriodSelect value={periodKey} onChange={setPeriodKey} />
      </div>
      {failed && <StateMessage state="error" emptyText="" onRetry={retry} />}
      {series.isPending && <StateMessage state="loading" emptyText="" onRetry={noop} />}
      {series.data !== undefined && visibleSeries.length === 0 && (
        <StateMessage
          state="empty"
          emptyText={t(
            periodKey === 'today' ? TEXT_KEYS.noReadingsToday : TEXT_KEYS.noReadingsPeriod,
          )}
          onRetry={noop}
        />
      )}
      {visibleSeries.length > 0 && (
        <TemperatureChart series={visibleSeries} period={period} pyrometers={all} />
      )}
    </div>
  );
}
