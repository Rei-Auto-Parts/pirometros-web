import { useState } from 'react';

import { READINGS_PAGE_SIZE } from '../../../core/domain/constants/readings.constants';
import { TEXT_KEYS } from '../../../core/domain/constants/text-keys.constants';
import { sortByDisplayName } from '../../../core/domain/models/pyrometer-name.model';
import { getTodayPeriod } from '../../../core/domain/models/reading-period.model';
import { t } from '../../../infra/tools/i18n.tool';
import type { ListReadingsInput } from '../../../interfaces/core/application/i-list-readings.use-case';
import { Pagination } from '../components/Pagination';
import { PeriodFilter } from '../components/PeriodFilter';
import { PyrometerFilter } from '../components/PyrometerFilter';
import { ReadingsTable } from '../components/ReadingsTable';
import { StateMessage } from '../components/StateMessage';
import { usePyrometers } from '../hooks/usePyrometers';
import { useReadings } from '../hooks/useReadings';

type Period = NonNullable<ListReadingsInput['period']>;

const MINUTE_LENGTH = 16;

function todayDraft(): Period {
  const { start, end } = getTodayPeriod();
  return { start: start.slice(0, MINUTE_LENGTH), end: end.slice(0, MINUTE_LENGTH) };
}

export function ReadingsPage() {
  const [draft, setDraft] = useState<Period>(todayDraft);
  const [period, setPeriod] = useState<Period | null>(null);
  const [pyrometerId, setPyrometerId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const pyrometers = usePyrometers();
  const readings = useReadings({ period, pyrometerId, page });

  const consult = (): void => {
    setPeriod(draft);
    setPage(1);
  };
  const changePyrometer = (id: string | null): void => {
    setPyrometerId(id);
    setPage(1);
  };
  const noop = (): void => undefined;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">{t(TEXT_KEYS.readingsTitle)}</h1>
        <p className="text-muted-foreground">{t(TEXT_KEYS.readingsDescription)}</p>
      </header>
      <div className="flex flex-wrap items-end gap-4">
        <PeriodFilter
          start={draft.start}
          end={draft.end}
          onStartChange={(start) => setDraft({ ...draft, start })}
          onEndChange={(end) => setDraft({ ...draft, end })}
          onSubmit={consult}
        />
        <PyrometerFilter
          pyrometers={sortByDisplayName(pyrometers.data ?? [])}
          value={pyrometerId}
          onChange={changePyrometer}
        />
      </div>
      {readings.isError && (
        <StateMessage state="error" emptyText="" onRetry={() => void readings.refetch()} />
      )}
      {readings.isPending && <StateMessage state="loading" emptyText="" onRetry={noop} />}
      {readings.data?.items.length === 0 && (
        <StateMessage state="empty" emptyText={t(TEXT_KEYS.noReadingsPeriod)} onRetry={noop} />
      )}
      {readings.data !== undefined && readings.data.items.length > 0 && (
        <>
          <ReadingsTable items={readings.data.items} pyrometers={pyrometers.data ?? []} />
          <Pagination
            page={page}
            total={readings.data.total}
            pageSize={READINGS_PAGE_SIZE}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
