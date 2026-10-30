import type { TextKey } from '../../core/domain/constants/text-keys.constants';

const PT_BR: Record<TextKey, string> = {
  appName: 'Pirômetros',
  sidebarLabel: 'Menu lateral',
  navigationLabel: 'Navegação principal',
  homeTitle: 'Início',
  homeDescription: 'Acompanhe as leituras dos pirômetros de imersão da fundição.',
  statusTitle: 'Status do sistema',
  statusChecking: 'Verificando…',
  serviceApi: 'API',
  serviceDatabase: 'Banco de dados',
  stateUp: 'No ar',
  stateDown: 'Fora do ar',
  stateUnknown: 'Indeterminado',
};

export function t(key: TextKey): string {
  return PT_BR[key];
}
