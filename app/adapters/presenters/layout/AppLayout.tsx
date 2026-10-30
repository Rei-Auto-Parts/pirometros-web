import { Outlet } from 'react-router-dom';
import { TEXT_KEYS } from '../../../core/domain/constants/text-keys.constants';
import { t } from '../../../infra/tools/i18n.tool';

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <aside aria-label={t(TEXT_KEYS.sidebarLabel)} className="bg-card w-60 shrink-0 border-r p-4">
        <p className="mb-6 text-lg font-semibold">{t(TEXT_KEYS.appName)}</p>
        <nav aria-label={t(TEXT_KEYS.navigationLabel)}>
          <ul className="flex flex-col gap-1" />
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
