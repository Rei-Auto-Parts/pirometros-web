import { useId, type ChangeEvent, type FormEvent } from 'react';

import { TEXT_KEYS } from '../../../core/domain/constants/text-keys.constants';
import { isPeriodValid } from '../../../core/domain/models/reading-period.model';
import { t } from '../../../infra/tools/i18n.tool';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

type PeriodFilterProps = {
  start: string;
  end: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onSubmit: () => void;
};

export function PeriodFilter({
  start,
  end,
  onStartChange,
  onEndChange,
  onSubmit,
}: PeriodFilterProps): React.JSX.Element {
  const startId = useId();
  const endId = useId();
  const valid: boolean = isPeriodValid(start, end);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (valid) onSubmit();
  };
  const handle =
    (callback: (value: string) => void) =>
    (event: ChangeEvent<HTMLInputElement>): void =>
      callback(event.target.value);

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor={startId} className="text-sm font-medium">
          {t(TEXT_KEYS.periodStart)}
        </label>
        <Input id={startId} type="datetime-local" value={start} onChange={handle(onStartChange)} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={endId} className="text-sm font-medium">
          {t(TEXT_KEYS.periodEnd)}
        </label>
        <Input id={endId} type="datetime-local" value={end} onChange={handle(onEndChange)} />
      </div>
      <Button type="submit" disabled={!valid}>
        {t(TEXT_KEYS.consult)}
      </Button>
      {!valid && (
        <p role="alert" className="text-sm text-destructive">
          {t(TEXT_KEYS.periodInvalid)}
        </p>
      )}
    </form>
  );
}
