import { TEXT_KEYS } from '../../../core/domain/constants/text-keys.constants';
import { t } from '../../../infra/tools/i18n.tool';
import { Alert } from '../ui/alert';
import { Button } from '../ui/button';

export type StateMessageState = 'loading' | 'empty' | 'error';

export interface StateMessageProps {
  state: StateMessageState;
  emptyText: string;
  onRetry: () => void;
}

export function StateMessage({ state, emptyText, onRetry }: StateMessageProps) {
  if (state === 'loading') {
    return (
      <p role="status" className="text-muted-foreground text-sm">
        {t(TEXT_KEYS.loading)}
      </p>
    );
  }
  if (state === 'empty') {
    return <p className="text-muted-foreground text-sm">{emptyText}</p>;
  }
  return (
    <Alert>
      <p>{t(TEXT_KEYS.dataUnavailable)}</p>
      <Button variant="outline" onClick={onRetry}>
        {t(TEXT_KEYS.retry)}
      </Button>
    </Alert>
  );
}
