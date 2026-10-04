'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Camera,
  FileSpreadsheet,
  BarChart3,
  Calendar,
  FolderKanban,
  FileText,
  Receipt,
  Users,
  Upload,
  Video,
  AlertTriangle,
  Folder,
  Clapperboard,
} from 'lucide-react';
import type { DashboardQuickAction } from '@/types';

interface DashboardHeaderBannerProps {
  userName?: string;
  role: string;
  quickActions?: DashboardQuickAction[];
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  Plus: <Plus className="size-3.5" />,
  Camera: <Camera className="size-3.5" />,
  FileSpreadsheet: <FileSpreadsheet className="size-3.5" />,
  BarChart3: <BarChart3 className="size-3.5" />,
  Calendar: <Calendar className="size-3.5" />,
  FolderKanban: <FolderKanban className="size-3.5" />,
  FileText: <FileText className="size-3.5" />,
  Receipt: <Receipt className="size-3.5" />,
  Users: <Users className="size-3.5" />,
  Upload: <Upload className="size-3.5" />,
  Video: <Video className="size-3.5" />,
  AlertTriangle: <AlertTriangle className="size-3.5" />,
  Folder: <Folder className="size-3.5" />,
  Clapperboard: <Clapperboard className="size-3.5" />,
};

export function DashboardHeaderBanner({
  userName,
  role,
  quickActions = [],
}: DashboardHeaderBannerProps) {
  const getRoleDescription = (r: string) => {
    switch (r.toUpperCase()) {
      case 'OWNER':
        return 'Visão executiva da produtora, faturamento, margens e pipeline de orçamentos.';
      case 'MANAGER':
        return 'Controlo de operações, ocupação de estúdios e cronograma semanal de rodagens.';
      case 'PRODUCER':
        return 'Gestão de sets, diárias de filmagem, call sheets e despesas de produção.';
      case 'FINANCE':
        return 'Fluxo de caixa, conciliação com Mindgest, contas a receber e faturas.';
      case 'EDITOR':
        return 'Ilha de pós-produção, entregáveis em revisão de clientes e versões finais.';
      case 'CREW':
        return 'Equipamentos técnicos atribuídos, check-outs e histórico de rodagens.';
      default:
        return 'Centro de controlo da produtora audiovisual.';
    }
  };

  return (
    <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full bg-card p-5 rounded-xs border border-border shadow-none">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg md:text-xl font-semibold tracking-tight text-foreground">
            {userName ? `Olá, ${userName}` : 'Bem-vindo ao Nora Studio'}
          </h2>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5 font-semibold rounded-xs">
            {role.toUpperCase()}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {getRoleDescription(role)}
        </p>
      </div>

      {/* Ações Rápidas Dinâmicas */}
      {quickActions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {quickActions.map((action, i) => (
            <Link key={i} href={action.href}>
              <Button
                size="sm"
                variant={action.variant === 'default' ? 'default' : 'outline'}
                className="text-xs gap-1.5 h-8 font-medium shadow-none rounded-xs"
              >
                {ACTION_ICONS[action.icon] || <Plus className="size-3.5" />}
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
