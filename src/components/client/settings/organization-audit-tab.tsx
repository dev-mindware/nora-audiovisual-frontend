'use client';

import { useState, useMemo } from 'react';
import {
  GenericTable,
  Column,
  ListSkeleton,
  EmptyState,
  SearchHandlerWrapper,
} from '@/components';
import { useTenantAudit } from '@/hooks/use-tenant-audit';
import { InvestigativeAuditEvent, AuditCategory, AuditSeverity } from '@/types/audit';
import { format } from 'date-fns';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  History,
  LayoutList,
  GitCommitHorizontal,
  Laptop,
  User,
  Clock,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { AuditInvestigationDrawer } from '../admin/audit/audit-investigation-drawer';
import { AuditTimelineView } from '../admin/audit/audit-timeline-view';

const CATEGORIES: { label: string; value: AuditCategory | 'ALL' }[] = [
  { label: 'Todas as Categorias', value: 'ALL' },
  { label: 'Projetos', value: 'PROJECTS' },
  { label: 'Comercial & Orçamentos', value: 'COMMERCIAL' },
  { label: 'Finanças & Pagamentos', value: 'FINANCE' },
  { label: 'Equipa & Membros', value: 'USERS' },
  { label: 'Equipamentos & Estúdios', value: 'RESOURCES' },
  { label: 'Autenticação & Sessões', value: 'AUTHENTICATION' },
  { label: 'Configurações do Estúdio', value: 'ORGANIZATION' },
];

const SEVERITIES: { label: string; value: AuditSeverity | 'ALL' }[] = [
  { label: 'Todas as Severidades', value: 'ALL' },
  { label: 'Crítico', value: 'CRITICAL' },
  { label: 'Alta', value: 'HIGH' },
  { label: 'Média', value: 'MEDIUM' },
  { label: 'Informativo', value: 'INFO' },
];

export function OrganizationAuditTab() {
  const {
    logs,
    isLoading,
    search,
    setSearch,
    category,
    setCategory,
    severity,
    setSeverity,
  } = useTenantAudit();

  const [viewMode, setViewMode] = useState<'TABLE' | 'TIMELINE'>('TABLE');
  const [selectedEvent, setSelectedEvent] = useState<InvestigativeAuditEvent | null>(null);

  const metrics = useMemo(() => {
    const total = logs.length;
    const critical = logs.filter((l) => l.severity === 'CRITICAL' || l.severity === 'HIGH').length;
    const uniqueActors = new Set(logs.map((l) => l.actor?.id).filter(Boolean)).size;
    const uniqueDevices = new Set(logs.map((l) => l.device?.formattedUserAgent).filter(Boolean)).size;

    return { total, critical, uniqueActors, uniqueDevices };
  }, [logs]);

  const columns: Column<InvestigativeAuditEvent>[] = [
    {
      key: 'action',
      header: 'Ação & Contexto',
      render: (_, item) => {
        const isCritical = item.severity === 'CRITICAL';
        const isHigh = item.severity === 'HIGH';
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-semibold text-foreground">
                {item.action}
              </span>
              {(isCritical || isHigh) && (
                <span
                  className={`size-2 rounded-full ${
                    isCritical ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                />
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.2 text-[10px] uppercase font-medium rounded bg-muted text-muted-foreground border border-border">
                {item.category}
              </span>
              {item.target?.name && (
                <span className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                  • {item.target.name}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'actor',
      header: 'Quem Executou',
      render: (_, item) => (
        <div className="text-xs space-y-0.5">
          <div className="font-medium text-foreground">{item.actor?.name || 'Membro da Equipa'}</div>
          <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
            <span>{item.actor?.role || 'MEMBER'}</span>
            <span>•</span>
            <span className="truncate max-w-[130px]">{item.actor?.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'device',
      header: 'Dispositivo & IP',
      render: (_, item) => (
        <div className="text-xs space-y-0.5">
          <div className="text-foreground truncate max-w-[180px] font-medium">
            {item.device?.formattedUserAgent || 'Dispositivo Padrão'}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            {item.network?.ip || '127.0.0.1'}
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Data & Hora',
      render: (_, item) => (
        <span className="text-xs font-mono text-muted-foreground">
          {item.createdAt ? format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm:ss') : '—'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Deltas & Detalhes',
      render: (_, item) => (
        <button
          onClick={() => setSelectedEvent(item)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-border bg-muted/60 hover:bg-muted text-foreground transition-colors"
        >
          <Eye className="size-3.5 text-primary" />
          Ver Detalhes
        </button>
      ),
    },
  ];

  if (isLoading) {
    return <ListSkeleton rows={5} cols={5} />;
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h3 className="text-base font-semibold text-foreground">
          Auditoria &amp; Governança do Estúdio
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Rastreie com precisão todas as alterações efetuadas em orçamentos, projetos, equipamentos e permissões da sua produtora.
        </p>
      </div>

      {/* KPI Cards de Governança da Produtora */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Acontecimentos Registados
          </span>
          <p className="text-2xl font-bold text-foreground">{metrics.total}</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-500">
            Ações de Alta Severidade
          </span>
          <p className="text-2xl font-bold text-foreground">{metrics.critical}</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Membros que Interagiram
          </span>
          <p className="text-2xl font-bold text-foreground">{metrics.uniqueActors}</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Dispositivos Distintos
          </span>
          <p className="text-2xl font-bold text-foreground">{metrics.uniqueDevices}</p>
        </div>
      </div>

      {/* Filtros e Alternador Tabela/Timeline */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <SearchHandlerWrapper
            search={search}
            setSearch={setSearch}
            placeholder="Pesquisar por projeto, orçamento, membro ou ação..."
            className="w-full md:max-w-md"
          />

          <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-muted/30 self-start md:self-auto">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'TABLE'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutList className="size-3.5" />
              Tabela
            </button>
            <button
              onClick={() => setViewMode('TIMELINE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'TIMELINE'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <GitCommitHorizontal className="size-3.5" />
              Timeline
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {SEVERITIES.map((sev) => (
              <option key={sev.value} value={sev.value}>
                {sev.label}
              </option>
            ))}
          </select>

          {(category !== 'ALL' || severity !== 'ALL' || search) && (
            <button
              onClick={() => {
                setCategory('ALL');
                setSeverity('ALL');
                setSearch('');
              }}
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      {logs.length > 0 ? (
        viewMode === 'TABLE' ? (
          <GenericTable<InvestigativeAuditEvent>
            data={logs}
            columns={columns}
            total={logs.length}
            totalPages={Math.ceil(logs.length / 10) || 1}
            emptyMessage="Nenhum registo de auditoria encontrado"
          />
        ) : (
          <div className="p-6 rounded-xl border border-border bg-card/40">
            <AuditTimelineView
              logs={logs}
              onSelectEvent={(event) => setSelectedEvent(event)}
            />
          </div>
        )
      ) : (
        <EmptyState
          title="Sem Registos de Atividade"
          description={
            search || category !== 'ALL' || severity !== 'ALL'
              ? 'Nenhum acontecimento corresponde aos filtros selecionados.'
              : 'Nenhuma alteração ou evento recente registado para a sua produtora.'
          }
          icon="History"
        />
      )}

      {/* Drawer com Deltas Antes vs. Depois */}
      <AuditInvestigationDrawer
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        onFilterCorrelation={(corrId) => {
          setSelectedEvent(null);
          setSearch(corrId);
        }}
      />
    </div>
  );
}
