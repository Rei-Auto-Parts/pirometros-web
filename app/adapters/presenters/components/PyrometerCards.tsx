import { TEXT_KEYS } from '../../../core/domain/constants/text-keys.constants';
import type { PyrometerDto } from '../../../core/domain/dtos/pyrometer.dto';
import type {
  PyrometerSeriesDto,
  SeriesPointDto,
} from '../../../core/domain/dtos/pyrometer-series.dto';
import type { PyrometerSummaryDto } from '../../../core/domain/dtos/pyrometer-summary.dto';
import { onlyActive, sortByDisplayName } from '../../../core/domain/models/pyrometer-name.model';
import { t } from '../../../infra/tools/i18n.tool';
import { PyrometerCard } from './PyrometerCard';

const NO_POINTS: readonly SeriesPointDto[] = [];

interface PyrometerCardsProps {
  readonly pyrometers: readonly PyrometerDto[];
  readonly summaries: readonly PyrometerSummaryDto[];
  /** Serie da ultima hora, de todos os pirometros, para a miniatura. */
  readonly series: readonly PyrometerSeriesDto[];
  readonly selectedId: string | null;
  readonly onSelect: (id: string | null) => void;
}

/** Um card por pirometro ativo, em ordem alfabetica pelo nome mostrado. Clicar de novo desmarca. */
export function PyrometerCards({
  pyrometers,
  summaries,
  series,
  selectedId,
  onSelect,
}: PyrometerCardsProps) {
  const visible = sortByDisplayName(onlyActive(pyrometers));
  return (
    <section aria-label={t(TEXT_KEYS.summaryCardsLabel)}>
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((pyrometer) => (
          <li key={pyrometer.id}>
            <PyrometerCard
              pyrometer={pyrometer}
              summary={summaries.find((item) => item.pyrometerId === pyrometer.id)}
              points={series.find((item) => item.pyrometerId === pyrometer.id)?.points ?? NO_POINTS}
              selected={pyrometer.id === selectedId}
              onSelect={() => onSelect(pyrometer.id === selectedId ? null : pyrometer.id)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
