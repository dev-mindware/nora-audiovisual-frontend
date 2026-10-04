'use client';

import React from 'react';
import Link from 'next/link';
import { OverviewSectionCard } from '../overview/overview-section-card';
import { Icon } from '@/components';
import { icons } from 'lucide-react';
import type { DashboardQuickAction } from '@/types';

interface MindgestQuickActionsProps {
  title?: string;
  icon?: keyof typeof icons;
  actions: DashboardQuickAction[];
}

export function MindgestQuickActions({
  title = 'Ações Rápidas',
  icon = 'Zap',
  actions,
}: MindgestQuickActionsProps) {
  return (
    <OverviewSectionCard title={title} icon={icon}>
      {actions.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nenhuma ação rápida disponível.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-1">
          {actions.map((act) => {
            const iconName = (act.icon as keyof typeof icons) || 'ArrowRight';
            const isPrimary = act.variant === 'default';

            return (
              <Link
                key={act.label + act.href}
                href={act.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-xs font-semibold border transition-all ${
                  isPrimary
                    ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 shadow-xs'
                    : 'bg-card text-foreground border-border hover:bg-muted/70 hover:border-primary/40'
                }`}
              >
                <Icon
                  name={iconName}
                  className={`size-4 shrink-0 ${isPrimary ? 'text-primary-foreground' : 'text-primary'}`}
                />
                <span className="truncate flex-1">{act.label}</span>
                <Icon
                  name="ChevronRight"
                  className="size-3.5 opacity-60 shrink-0"
                />
              </Link>
            );
          })}
        </div>
      )}
    </OverviewSectionCard>
  );
}
