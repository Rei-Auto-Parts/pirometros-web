import { Moon, Sun } from 'lucide-react';

import { TEXT_KEYS } from '@/core/domain/constants/text-keys.constants';
import { cn } from '@/infra/tools/cn';
import { t } from '@/infra/tools/i18n.tool';
import type { Theme } from '../hooks/useTheme';
import { Button } from '../ui/button';

export interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
  collapsed?: boolean;
}

export function ThemeToggle({
  theme,
  onToggle,
  collapsed = false,
}: ThemeToggleProps): React.JSX.Element {
  const isLight: boolean = theme === 'light';
  const Icon = isLight ? Moon : Sun;
  const label: string = t(isLight ? TEXT_KEYS.switchToDark : TEXT_KEYS.switchToLight);
  return (
    <Button
      variant="ghost"
      size={collapsed ? 'icon' : 'default'}
      onClick={onToggle}
      title={collapsed ? label : undefined}
      className={cn(!collapsed && 'w-full justify-start')}
    >
      <Icon aria-hidden="true" className="size-4" />
      <span className={cn(collapsed && 'sr-only')}>{label}</span>
    </Button>
  );
}
