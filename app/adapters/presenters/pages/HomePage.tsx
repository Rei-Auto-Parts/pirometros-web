import { TEXT_KEYS, type TextKey } from '../../../core/domain/constants/text-keys.constants';
import type { ServiceState } from '../../../core/domain/dtos/health-status.dto';
import { t } from '../../../infra/tools/i18n.tool';
import { useHealth } from '../hooks/useHealth';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const STATE_TEXT: Record<ServiceState, TextKey> = {
  up: TEXT_KEYS.stateUp,
  down: TEXT_KEYS.stateDown,
  unknown: TEXT_KEYS.stateUnknown,
};

const STATE_VARIANT = { up: 'default', down: 'destructive', unknown: 'secondary' } as const;

interface ServiceRowProps {
  readonly name: string;
  readonly state: ServiceState | null;
}

function ServiceRow({ name, state }: ServiceRowProps) {
  return (
    <li className="flex items-center justify-between">
      <span>{name}</span>
      {state === null ? (
        <span className="text-muted-foreground text-sm">{t(TEXT_KEYS.statusChecking)}</span>
      ) : (
        <Badge variant={STATE_VARIANT[state]}>{t(STATE_TEXT[state])}</Badge>
      )}
    </li>
  );
}

export function HomePage() {
  const { data } = useHealth();

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">{t(TEXT_KEYS.homeTitle)}</h1>
        <p className="text-muted-foreground">{t(TEXT_KEYS.homeDescription)}</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t(TEXT_KEYS.statusTitle)}</h2>
          </CardTitle>
          <CardDescription />
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-3">
            <ServiceRow name={t(TEXT_KEYS.serviceApi)} state={data?.api ?? null} />
            <ServiceRow name={t(TEXT_KEYS.serviceDatabase)} state={data?.database ?? null} />
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
