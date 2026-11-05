import { useId, type ChangeEvent } from 'react';

import { TEXT_KEYS } from '../../../core/domain/constants/text-keys.constants';
import type { PyrometerDto } from '../../../core/domain/dtos/pyrometer.dto';
import { displayName } from '../../../core/domain/models/pyrometer-name.model';
import { t } from '../../../infra/tools/i18n.tool';

type PyrometerFilterProps = {
  pyrometers: readonly PyrometerDto[];
  value: string | null;
  onChange: (id: string | null) => void;
};

export function PyrometerFilter({
  pyrometers,
  value,
  onChange,
}: PyrometerFilterProps): React.JSX.Element {
  const id = useId();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>): void =>
    onChange(event.target.value === '' ? null : event.target.value);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {t(TEXT_KEYS.pyrometerLabel)}
      </label>
      <select
        id={id}
        value={value ?? ''}
        onChange={handleChange}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="">{t(TEXT_KEYS.allPyrometers)}</option>
        {pyrometers.map((pyrometer) => (
          <option key={pyrometer.id} value={pyrometer.id}>
            {pyrometer.active
              ? displayName(pyrometer)
              : `${displayName(pyrometer)} ${t(TEXT_KEYS.inactiveSuffix)}`}
          </option>
        ))}
      </select>
    </div>
  );
}
