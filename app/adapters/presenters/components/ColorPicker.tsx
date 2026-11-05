import { Check } from 'lucide-react';
import { useRef, type KeyboardEvent } from 'react';
import { PYROMETER_PALETTE } from '../../../core/domain/constants/pyrometer-profile.constants';
import { TEXT_KEYS } from '../../../core/domain/constants/text-keys.constants';
import { cn } from '../../../infra/tools/cn';
import { t } from '../../../infra/tools/i18n.tool';

interface ColorPickerProps {
  readonly value: string;
  /** Cor em minuscula -> nome de quem a usa; essas cores ficam desabilitadas e riscadas. */
  readonly inUse?: ReadonlyMap<string, string>;
  readonly onChange: (color: string) => void;
}

const STEPS: Readonly<Record<string, number>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/**
 * So as 12 cores da paleta (nao ha seletor livre), em grade de 6 por linha. Teclado: Tab entra e
 * sai do grupo; as setas escolhem a proxima cor livre. O nome da cor e o rotulo de cada opcao.
 */
export function ColorPicker({ value, inUse = new Map(), onChange }: ColorPickerProps) {
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const isUsed = (hex: string): boolean => inUse.has(hex.toLowerCase());
  const selectedIndex = PYROMETER_PALETTE.findIndex(
    (color) => color.value.toLowerCase() === value.toLowerCase(),
  );
  const tabStop =
    selectedIndex >= 0
      ? selectedIndex
      : PYROMETER_PALETTE.findIndex((color) => !isUsed(color.value));
  const total = PYROMETER_PALETTE.length;

  const move = (from: number, step: number): void => {
    for (let distance = 1; distance <= total; distance += 1) {
      const index = (((from + step * distance) % total) + total) % total;
      const candidate = PYROMETER_PALETTE[index];
      if (candidate !== undefined && !isUsed(candidate.value)) {
        onChange(candidate.value);
        buttons.current[index]?.focus();
        return;
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const step = STEPS[event.key];
    if (step === undefined) return;
    event.preventDefault();
    move(index, step);
  };

  const chosen = PYROMETER_PALETTE[selectedIndex];
  return (
    <div className="flex flex-col gap-2">
      <div
        role="radiogroup"
        aria-label={t(TEXT_KEYS.colorLabel)}
        className="grid grid-cols-6 gap-2"
      >
        {PYROMETER_PALETTE.map((color, index) => {
          const selected = index === selectedIndex;
          const owner = inUse.get(color.value.toLowerCase());
          const label =
            owner === undefined
              ? t(color.nameKey)
              : `${t(color.nameKey)} (${t(TEXT_KEYS.colorInUseBy)} ${owner})`;
          return (
            <button
              key={color.value}
              ref={(element) => {
                buttons.current[index] = element;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={label}
              title={label}
              disabled={owner !== undefined}
              tabIndex={index === tabStop ? 0 : -1}
              onClick={() => onChange(color.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              style={{ backgroundColor: color.value }}
              className={cn(
                'focus-visible:ring-ring relative flex size-8 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                selected && 'ring-foreground ring-2 ring-offset-2',
                owner !== undefined && 'cursor-not-allowed opacity-40',
              )}
            >
              {selected && <Check aria-hidden="true" className="size-4 text-white drop-shadow" />}
              {owner !== undefined && (
                <span
                  data-strike
                  aria-hidden="true"
                  className="bg-foreground absolute inset-x-0.5 top-1/2 h-0.5 -rotate-45"
                />
              )}
            </button>
          );
        })}
      </div>
      <p className="text-muted-foreground text-xs">
        {chosen === undefined ? value : `${t(chosen.nameKey)} · ${chosen.value}`}
      </p>
    </div>
  );
}
