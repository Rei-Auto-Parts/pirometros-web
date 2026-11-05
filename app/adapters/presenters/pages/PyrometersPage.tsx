import { useCallback, useMemo, useState } from 'react';
import { TEXT_KEYS } from '../../../core/domain/constants/text-keys.constants';
import { colorsInUse } from '../../../core/domain/models/pyrometer-color.model';
import { sortByDisplayName } from '../../../core/domain/models/pyrometer-name.model';
import { t } from '../../../infra/tools/i18n.tool';
import { PyrometerEditPanel } from '../components/PyrometerEditPanel';
import { PyrometerList } from '../components/PyrometerList';
import { StateMessage } from '../components/StateMessage';
import { usePyrometers } from '../hooks/usePyrometers';

/**
 * Lista a esquerda e painel de edicao a direita (empilhados abaixo de 1024 px). So edita o que ja
 * existe nos dados: nao ha como criar nem excluir. Com alteracao nao salva, a troca de pirometro
 * fica bloqueada ate o usuario salvar ou descartar.
 */
export function PyrometersPage() {
  const pyrometers = usePyrometers();
  const sorted = useMemo(() => sortByDisplayName(pyrometers.data ?? []), [pyrometers.data]);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [dirty, setDirty] = useState<boolean>(false);
  const selected = sorted.find((item) => item.id === chosenId) ?? sorted[0];
  const noop = (): void => undefined;

  const requestSelect = (id: string): void => {
    if (id === selected?.id) {
      setPendingId(null);
    } else if (dirty) {
      setPendingId(id);
    } else {
      setChosenId(id);
    }
  };

  // Quando a alteracao some (salvou ou descartou), a troca pedida acontece.
  const handleDirtyChange = useCallback(
    (next: boolean): void => {
      setDirty(next);
      if (!next && pendingId !== null) {
        setChosenId(pendingId);
        setPendingId(null);
      }
    },
    [pendingId],
  );

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold">{t(TEXT_KEYS.pyrometersTitle)}</h1>
        <p className="text-muted-foreground text-sm">{t(TEXT_KEYS.pyrometersDescription)}</p>
      </header>
      {pyrometers.isError && (
        <StateMessage state="error" emptyText="" onRetry={() => void pyrometers.refetch()} />
      )}
      {pyrometers.isPending && <StateMessage state="loading" emptyText="" onRetry={noop} />}
      {pyrometers.data?.length === 0 && (
        <StateMessage state="empty" emptyText={t(TEXT_KEYS.noPyrometers)} onRetry={noop} />
      )}
      {selected !== undefined && (
        <div data-layout className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <PyrometerList pyrometers={sorted} selectedId={selected.id} onSelect={requestSelect} />
          <div className="lg:sticky lg:top-4">
            <PyrometerEditPanel
              key={selected.id}
              pyrometer={selected}
              colorsInUse={colorsInUse(sorted, selected.id)}
              blocked={pendingId !== null}
              onDirtyChange={handleDirtyChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
