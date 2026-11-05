import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { TEXT_KEYS } from '../../../core/domain/constants/text-keys.constants';
import { cn } from '../../../infra/tools/cn';
import { t } from '../../../infra/tools/i18n.tool';
import { SidebarNav } from '../components/SidebarNav';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../hooks/useTheme';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const { theme, toggle } = useTheme();

  return (
    <div className="flex min-h-screen">
      <aside
        aria-label={t(TEXT_KEYS.sidebarLabel)}
        className={cn(
          'bg-card sticky top-0 flex h-screen shrink-0 flex-col border-r p-3',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        <p className={cn('mb-6 px-3 pt-1 text-lg font-semibold', collapsed && 'sr-only')}>
          {t(TEXT_KEYS.appName)}
        </p>
        <SidebarNav collapsed={collapsed} onToggle={() => setCollapsed((current) => !current)} />
        <div className="mt-auto border-t pt-3">
          <ThemeToggle theme={theme} onToggle={toggle} collapsed={collapsed} />
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
