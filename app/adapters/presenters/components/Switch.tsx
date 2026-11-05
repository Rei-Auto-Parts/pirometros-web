import { cn } from '../../../infra/tools/cn';

interface SwitchProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
}

/** Interruptor acessivel com `input` nativo (`role="switch"`): teclado, foco e leitor de tela de graca. */
export function Switch({ label, checked, onChange }: SwitchProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        role="switch"
        className="peer sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        aria-hidden="true"
        className={cn(
          'bg-border relative h-5 w-9 shrink-0 rounded-full transition-colors',
          'peer-checked:bg-primary peer-focus-visible:ring-ring peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2',
          'after:bg-background after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:shadow-sm after:transition-transform',
          'peer-checked:after:translate-x-4',
        )}
      />
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}
