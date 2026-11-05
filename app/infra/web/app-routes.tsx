import type { RouteObject } from 'react-router-dom';
import { AppLayout } from '../../adapters/presenters/layout/AppLayout';
import { HealthPage } from '../../adapters/presenters/pages/HealthPage';
import { MonitoringPage } from '../../adapters/presenters/pages/MonitoringPage';
import { PyrometersPage } from '../../adapters/presenters/pages/PyrometersPage';
import { ReadingsPage } from '../../adapters/presenters/pages/ReadingsPage';
import { ROUTES } from '../../core/domain/constants/routes.constants';

/** Rotas da aplicacao; os testes BDD montam a mesma tabela num roteador em memoria. */
export const APP_ROUTES: RouteObject[] = [
  {
    path: ROUTES.monitoring,
    element: <AppLayout />,
    children: [
      { index: true, element: <MonitoringPage /> },
      { path: ROUTES.readings, element: <ReadingsPage /> },
      { path: ROUTES.pyrometers, element: <PyrometersPage /> },
      { path: ROUTES.health, element: <HealthPage /> },
    ],
  },
];
