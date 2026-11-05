import { useEffect, useId, useState, type FormEvent } from 'react';
import {
  NICKNAME_MAX_LENGTH,
  NOTE_MAX_LENGTH,
} from '../../../core/domain/constants/pyrometer-profile.constants';
import { TEXT_KEYS } from '../../../core/domain/constants/text-keys.constants';
import type { PyrometerDto } from '../../../core/domain/dtos/pyrometer.dto';
import { ProfileRejectedError } from '../../../core/domain/errors/profile-rejected.error';
import { displayName } from '../../../core/domain/models/pyrometer-name.model';
import { t } from '../../../infra/tools/i18n.tool';
import { useSavePyrometer } from '../hooks/useSavePyrometer';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ColorPicker } from './ColorPicker';
import { Switch } from './Switch';

interface Fields {
  readonly nickname: string;
  readonly note: string;
  readonly color: string;
  readonly active: boolean;
}

interface PyrometerEditPanelProps {
  readonly pyrometer: PyrometerDto;
  /** Cores que outros pirometros ja usam: ficam desabilitadas na paleta. */
  readonly colorsInUse?: ReadonlyMap<string, string>;
  /** O usuario tentou trocar de pirometro: mostra o aviso enquanto houver alteracao. */
  readonly blocked?: boolean;
  /** Avisa a pagina se ha alteracao nao salva (a pagina so troca de pirometro sem alteracao). */
  readonly onDirtyChange: (dirty: boolean) => void;
}

function fieldsOf(pyrometer: PyrometerDto): Fields {
  return {
    nickname: pyrometer.nickname ?? '',
    note: pyrometer.note ?? '',
    color: pyrometer.color,
    active: pyrometer.active,
  };
}

function blankToNull(value: string): string | null {
  return value.trim() === '' ? null : value;
}

function errorText(error: Error | null): string {
  if (!(error instanceof ProfileRejectedError)) return t(TEXT_KEYS.saveUnavailable);
  return error.status === 409 ? t(TEXT_KEYS.saveColorInUse) : t(TEXT_KEYS.saveRejected);
}

/** Painel de edicao do pirometro selecionado: so edita o que existe; erro e aviso ficam dentro do painel. */
export function PyrometerEditPanel({
  pyrometer,
  colorsInUse,
  blocked = false,
  onDirtyChange,
}: PyrometerEditPanelProps) {
  const ids = { nickname: useId(), note: useId() };
  const [baseline, setBaseline] = useState<Fields>(() => fieldsOf(pyrometer));
  const [fields, setFields] = useState<Fields>(baseline);
  const save = useSavePyrometer(pyrometer.id);

  const dirty =
    fields.nickname !== baseline.nickname ||
    fields.note !== baseline.note ||
    fields.color !== baseline.color ||
    fields.active !== baseline.active;
  const invalid =
    fields.nickname.length > NICKNAME_MAX_LENGTH || fields.note.length > NOTE_MAX_LENGTH;

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  const edit = (patch: Partial<Fields>): void => {
    if (!save.isIdle) save.reset();
    setFields((current) => ({ ...current, ...patch }));
  };

  const discard = (): void => {
    save.reset();
    setFields(baseline);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const submitted = fields;
    save.mutate(
      {
        nickname: blankToNull(submitted.nickname),
        color: submitted.color,
        note: blankToNull(submitted.note),
        active: submitted.active,
      },
      { onSuccess: () => setBaseline(submitted) },
    );
  };

  const name = displayName(pyrometer);
  return (
    <form
      aria-label={name}
      onSubmit={handleSubmit}
      className="bg-card flex flex-col gap-4 rounded-xl border p-4"
    >
      <div className="flex items-start gap-2">
        <span
          aria-hidden="true"
          className="mt-1.5 size-3 shrink-0 rounded-full"
          style={{ backgroundColor: pyrometer.color }}
        />
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold" title={name}>
            {name}
          </h2>
          <p className="text-muted-foreground text-xs">{pyrometer.id}</p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between">
          <label htmlFor={ids.nickname} className="text-sm font-medium">
            {t(TEXT_KEYS.nicknameLabel)}
          </label>
          <span className="text-muted-foreground text-xs">
            {fields.nickname.length}/{NICKNAME_MAX_LENGTH}
          </span>
        </div>
        <Input
          id={ids.nickname}
          value={fields.nickname}
          maxLength={NICKNAME_MAX_LENGTH}
          onChange={(event) => edit({ nickname: event.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">{t(TEXT_KEYS.colorLabel)}</span>
        <ColorPicker
          value={fields.color}
          inUse={colorsInUse}
          onChange={(color) => edit({ color })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between">
          <label htmlFor={ids.note} className="text-sm font-medium">
            {t(TEXT_KEYS.noteLabel)}
          </label>
          <span className="text-muted-foreground text-xs">
            {fields.note.length}/{NOTE_MAX_LENGTH}
          </span>
        </div>
        <textarea
          id={ids.note}
          value={fields.note}
          maxLength={NOTE_MAX_LENGTH}
          rows={3}
          onChange={(event) => edit({ note: event.target.value })}
          className="bg-background resize-none rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <Switch
        label={t(TEXT_KEYS.activeLabel)}
        checked={fields.active}
        onChange={(active) => edit({ active })}
      />
      {blocked && dirty && (
        <p role="alert" className="bg-secondary rounded-md px-3 py-2 text-sm">
          {t(TEXT_KEYS.unsavedChanges)}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        <Button type="submit" disabled={!dirty || invalid || save.isPending}>
          {save.isPending ? t(TEXT_KEYS.saving) : t(TEXT_KEYS.save)}
        </Button>
        {dirty && (
          <Button type="button" variant="outline" onClick={discard}>
            {t(TEXT_KEYS.discardChanges)}
          </Button>
        )}
        {save.isSuccess && !dirty && (
          <p role="status" className="text-muted-foreground text-sm">
            {t(TEXT_KEYS.saved)}
          </p>
        )}
      </div>
      {save.isError && (
        <p role="alert" className="text-destructive text-sm">
          {errorText(save.error)}
        </p>
      )}
    </form>
  );
}
