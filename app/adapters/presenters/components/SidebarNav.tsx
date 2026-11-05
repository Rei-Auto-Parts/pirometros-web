import { Activity, Gauge, HeartPulse, List, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';

import { ROUTES } from '../../../core/domain/constants/routes.constants';
import { TEXT_KEYS, type TextKey } from '../../../core/domain/constants/text-keys.constants';
import { t } from '../../../infra/tools/i18n.tool';
import { cn } from '../../../infra/tools/cn';
import { Button } from '../ui/button';

type NavItem = {
  readonly to: string;
  readonly labelKey: TextKey;
  readonly Icon: ComponentType<{ className?: string }>;
};

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { to: ROUTES.monitoring, labelKey: TEXT_KEYS.navMonitoring, Icon: Activity },
  { to: ROUTES.readings, labelKey: TEXT_KEYS.navReadings, Icon: List },
  { to: ROUTES.pyrometers, labelKey: TEXT_KEYS.navPyrometers, Icon: Gauge },
  { to: ROUTES.health, labelKey: TEXT_KEYS.navHealth, Icon: HeartPulse },
];

type SidebarNavProps = {
  readonly collapsed: boolean;
  readonly onToggle: () => void;
};

function linkClass(isActive: boolean): string {
  return cn(
    'flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary',
    isActive && 'bg-secondary font-medium',
  );
}

function NavItemLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const label: string = t(item.labelKey);
  return (
    <NavLink
      to={item.to}
      end={item.to === ROUTES.monitoring}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      className={({ isActive }: { isActive: boolean }): string => linkClass(isActive)}
    >
      <item.Icon className="size-4 shrink-0" />
      <span className={cn(collapsed && 'sr-only')}>{label}</span>
    </NavLink>
  );
}

export function SidebarNav({ collapsed, onToggle }: SidebarNavProps) {
  const toggleLabel: string = t(collapsed ? TEXT_KEYS.expandMenu : TEXT_KEYS.collapseMenu);
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;
  return (
    <nav aria-label={t(TEXT_KEYS.navigationLabel)} className="flex flex-col gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        aria-label={toggleLabel}
        aria-expanded={!collapsed}
      >
        <ToggleIcon className="size-4" />
      </Button>
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item: NavItem) => (
          <li key={item.to}>
            <NavItemLink item={item} collapsed={collapsed} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
