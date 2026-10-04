'use client';

import React from 'react';
import Link from 'next/link';
import { OverviewSectionCard } from '../overview/overview-section-card';
import { Icon } from '@/components';
import { icons } from 'lucide-react';
import type { DashboardUrgentItem } from '@/types';

interface MindgestUrgentItemsProps {
  title: string;
  icon?: keyof typeof icons;
  items: DashboardUrgentItem[];
  emptyMessage?: string;
  href?: string;
  actionLabel?: string;
}

const TYPE_ICONS: Record<string, keyof typeof icons> = {
  project: 'FolderKanban',
  budget: 'FileSpreadsheet',
  shoot: 'Calendar',
  payment: 'CreditCard',
  deliverable: 'Video',
  gear: 'Camera',
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PENDENTE: { label: 'Pendente', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  SENT: { label: 'Enviado', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  APPROVED: { label: 'Aprovado', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  AGUARDA_CLIENTE: { label: 'Aguardando Cliente', className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  EM_CAMPO: { label: 'Em Campo', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  ACTIVE: { label: 'Ativo', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
};

export function MindgestUrgentItems({
  title,
  icon = 'CircleAlert',
  items,
  emptyMessage = 'Nenhuma pendência ou item urgente no período.',
  href,
  actionLabel = 'Ver todos',
}: MindgestUrgentItemsProps) {
  return (
    <OverviewSectionCard
      title={title}
      icon={icon}
      href={href}
      actionLabel={actionLabel}
    >
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {items.slice(0, 5).map((item) => {
            const iconName = TYPE_ICONS[item.type || 'project'] || 'CircleAlert';
            const badge = STATUS_BADGE[item.status] || {
              label: item.status,
              className: 'bg-muted text-muted-foreground',
            };

            return (
              <li
                key={item.id}
                className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon name={iconName} className="size-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="truncate text-xs text-muted-foreground">
                      {item.subtitle}
                    </p>
                  )}
                </div>

                <span
                  className={`shrink-0 px-2 py-0.5 text-[11px] font-semibold rounded-md ${badge.className}`}
                >
                  {badge.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </OverviewSectionCard>
  );
}
