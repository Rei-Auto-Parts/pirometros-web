import { useRef, type KeyboardEvent } from 'react';
import { TEXT_KEYS } from '../../../core/domain/constants/text-keys.constants';
import type { PyrometerDto } from '../../../core/domain/dtos/pyrometer.dto';
import { displayParts } from '../../../core/domain/models/pyrometer-name.model';
import { cn } from '../../../infra/tools/cn';
import { t } from '../../../infra/tools/i18n.tool';
import { Badge } from '../ui/badge';

interface PyrometerListProps {
  readonly pyrometers: readonly PyrometerDto[];
  readonly selectedId: string | null;
  readonly onSelect: (id: string) => void;
}

/** Lista compacta (uma linha por pirometro). Teclado: setas, Home/End e Enter; Tab entra e sai da lista. */
export function PyrometerList({ pyrometers, selectedId, onSelect }: PyrometerListProps) {
  const rows = useRef(new Map<string, HTMLLIElement>());
  const tabStopId = selectedId ?? pyrometers[0]?.id;

  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>, index: number): void => {
    const targets: Record<string, number> = {
      ArrowDown: index + 1,
      ArrowUp: index - 1,
      Home: 0,
      End: pyrometers.length - 1,
      Enter: index,
      ' ': index,
    };
    const target = pyrometers[targets[event.key] ?? -1];
    if (target === undefined) return;
    event.preventDefault();
    onSelect(target.id);
    rows.current.get(target.id)?.focus();
  };

  return (
    <ul
      role="listbox"
      aria-label={t(TEXT_KEYS.pyrometersListLabel)}
      className="bg-card divide-y overflow-y-auto rounded-xl border lg:max-h-[calc(100vh-11rem)]"
    >
      {pyrometers.map((pyrometer, index) => {
        const selected = pyrometer.id === selectedId;
        const { tag, nickname } = displayParts(pyrometer);
        return (
          <li
            key={pyrometer.id}
            ref={(element) => {
              if (element === null) rows.current.delete(pyrometer.id);
              else rows.current.set(pyrometer.id, element);
            }}
            role="option"
            aria-selected={selected}
            aria-current={selected ? 'true' : undefined}
            tabIndex={pyrometer.id === tabStopId ? 0 : -1}
            onClick={() => onSelect(pyrometer.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            style={selected ? { borderLeftColor: pyrometer.color } : undefined}
            className={cn(
              'hover:bg-secondary focus-visible:ring-ring flex min-h-11 cursor-pointer items-center gap-3 border-l-4 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-inset',
              selected ? 'bg-secondary' : 'border-l-transparent',
              !pyrometer.active && 'opacity-60',
            )}
          >
            <span
              aria-hidden="true"
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: pyrometer.color }}
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline gap-2">
                <span className="truncate text-sm">
                  <span className="font-normal">{tag}</span>
                  {nickname !== null && (
                    <>
                      {' - '}
                      <strong className="font-semibold">{nickname}</strong>
                    </>
                  )}
                </span>
                <span className="text-muted-foreground shrink-0 text-xs">{pyrometer.id}</span>
              </span>
              {pyrometer.note !== null && pyrometer.note !== '' && (
                <span
                  className="text-muted-foreground block truncate text-xs"
                  title={pyrometer.note}
                >
                  {pyrometer.note}
                </span>
              )}
            </span>
            <Badge variant={pyrometer.active ? 'outline' : 'secondary'}>
              {t(pyrometer.active ? TEXT_KEYS.activeBadge : TEXT_KEYS.inactiveBadge)}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}
