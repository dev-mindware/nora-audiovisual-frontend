'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/empty-state';
import {
  AlertCircle,
  FileSpreadsheet,
  Clapperboard,
  DollarSign,
  Camera,
  Film,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import type { DashboardUrgentItem } from '@/types';

interface UrgentItemsCardProps {
  items: DashboardUrgentItem[];
  title?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  viewAllHref?: string;
}

export function UrgentItemsCard({
  items = [],
  title = 'Atenção Imediata & Pendências',
  emptyTitle = 'Tudo em dia!',
  emptyDescription = 'Não existem pendências críticas ou aprovações pendentes para este período.',
  viewAllHref = '/projects',
}: UrgentItemsCardProps) {
  const getIcon = (type?: string) => {
    switch (type) {
      case 'budget':
        return <FileSpreadsheet className="size-3.5 text-emerald-600" />;
      case 'shoot':
      case 'project':
        return <Clapperboard className="size-3.5 text-primary" />;
      case 'payment':
        return <DollarSign className="size-3.5 text-amber-600" />;
      case 'gear':
        return <Camera className="size-3.5 text-blue-600" />;
      case 'deliverable':
        return <Film className="size-3.5 text-purple-600" />;
      default:
        return <AlertCircle className="size-3.5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDENTE':
      case 'SENT':
      case 'AGUARDA_CLIENTE':
        return <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20 rounded-xs font-semibold">{status}</Badge>;
      case 'NO_SET':
      case 'EM_CAMPO':
        return <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 rounded-xs font-semibold">{status}</Badge>;
      case 'ACTIVE':
        return <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20 rounded-xs font-semibold">Ativo</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] rounded-xs font-semibold">{status}</Badge>;
    }
  };

  return (
    <Card className="rounded-xs border border-border shadow-none bg-card overflow-hidden p-0 gap-0">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-border">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
          <AlertCircle className="size-3.5 text-amber-600" />
          {title}
        </CardTitle>
        {viewAllHref && (
          <Link href={viewAllHref}>
            <Button variant="ghost" size="sm" className="text-xs text-primary gap-1 h-7 px-2 font-medium rounded-xs">
              Ver todos <ArrowRight className="size-3" />
            </Button>
          </Link>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="py-6 px-4">
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              icon="CheckCircle"
              className="border-none bg-transparent py-4"
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div className="size-7 rounded-xs bg-muted/40 border border-border flex items-center justify-center shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-medium text-foreground truncate">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="text-[11px] text-muted-foreground truncate">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  {getStatusBadge(item.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
