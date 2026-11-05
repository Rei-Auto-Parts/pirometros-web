import { TEXT_KEYS } from '../../../core/domain/constants/text-keys.constants';
import { clampPercent } from '../../../core/domain/models/percent.model';
import { t } from '../../../infra/tools/i18n.tool';

interface BatteryIndicatorProps {
  readonly battery: number | null;
}

/**
 * Bateria como porcentagem (unidade presumida, a confirmar) com barra fina neutra de 0 a 100.
 * So informacao: sem cor de aviso nem alerta.
 */
export function BatteryIndicator({ battery }: BatteryIndicatorProps) {
  if (battery === null) {
    return (
      <span className="text-xs">
        {t(TEXT_KEYS.colBattery)} {t(TEXT_KEYS.emptyValue)}
      </span>
    );
  }
  return (
    <span className="flex flex-col gap-1 text-xs">
      <span>
        {t(TEXT_KEYS.colBattery)} {battery}%
      </span>
      <span aria-hidden="true" className="bg-muted block h-1 w-full overflow-hidden rounded-full">
        <span
          data-battery-bar
          className="bg-primary block h-full rounded-full"
          style={{ width: `${clampPercent(battery)}%` }}
        />
      </span>
    </span>
  );
}
