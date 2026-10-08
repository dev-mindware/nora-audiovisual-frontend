'use client';

import { useState, useMemo } from 'react';
import {
  GenericTable,
  Column,
  ListSkeleton,
  EmptyState,
  SearchHandlerWrapper,
} from '@/components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdmin } from '@/hooks/admin';
import { AuditLogItem, InvestigativeAuditEvent, AuditCategory, AuditSeverity } from '@/types/audit';
import { format } from 'date-fns';
import {
  LayoutList,
  GitCommitHorizontal,
  Filter,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Laptop,
  Smartphone,
  Tablet,
  Bot,
  User,
  Building2,
  Calendar,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { AuditInvestigationDrawer } from './audit-investigation-drawer';
import { AuditTimelineView } from './audit-timeline-view';

const CATEGORIES: { label: string; value: AuditCategory | 'ALL' }[] = [
  { label: 'Todas as Categorias', value: 'ALL' },
  { label: 'Autenticação', value: 'AUTHENTICATION' },
  { label: 'Organizações', value: 'ORGANIZATION' },
  { label: 'Utilizadores', value: 'USERS' },
  { label: 'Projectos', value: 'PROJECTS' },
  { label: 'Comercial', value: 'COMMERCIAL' },
  { label: 'Finanças', value: 'FINANCE' },
  { label: 'Recursos', value: 'RESOURCES' },
  { label: 'Add-Ons', value: 'ADDONS' },
  { label: 'Administração', value: 'ADMINISTRATION' },
  { label: 'Segurança', value: 'SECURITY' },
];

const SEVERITIES: { label: string; value: AuditSeverity | 'ALL' }[] = [
  { label: 'Todas as Severidades', value: 'ALL' },
  { label: 'Crítico', value: 'CRITICAL' },
  { label: 'Alta', value: 'HIGH' },
  { label: 'Média', value: 'MEDIUM' },
  { label: 'Baixa', value: 'LOW' },
  { label: 'Informativo', value: 'INFO' },
];

const OS_FILTERS = [
  { label: 'Todos os SOs', value: 'ALL' },
  { label: 'Windows', value: 'Windows' },
  { label: 'macOS', value: 'macOS' },
  { label: 'Linux', value: 'Linux' },
  { label: 'iOS', value: 'iOS' },
  { label: 'Android', value: 'Android' },
];

export function AdminAuditPageContent() {
  const { auditLogs, isLoadingAudit } = useAdmin();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [osFilter, setOsFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'TIMELINE'>('TABLE');
  const [selectedEvent, setSelectedEvent] = useState<InvestigativeAuditEvent | null>(null);

  // Normalização e filtragem rica dos logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log: any) => {
      // 1. Pesquisa textual
      if (search.trim()) {
        const q = search.toLowerCase();
        const actionMatch = log.action?.toLowerCase().includes(q);
        const orgMatch =
          log.organization?.name?.toLowerCase().includes(q) ||
          log.organizationName?.toLowerCase().includes(q) ||
          log.organization?.slug?.toLowerCase().includes(q);
        const actorMatch =
          log.actor?.name?.toLowerCase().includes(q) ||
          log.actor?.email?.toLowerCase().includes(q) ||
          log.userName?.toLowerCase().includes(q);
        const ipMatch = log.network?.ip?.toLowerCase().includes(q) || log.ipAddress?.toLowerCase().includes(q);
        const reqMatch = log.request?.correlationId?.toLowerCase().includes(q) || log.requestId?.toLowerCase().includes(q);

        if (!actionMatch && !orgMatch && !actorMatch && !ipMatch && !reqMatch) {
          return false;
        }
      }

      // 2. Categoria
      if (categoryFilter !== 'ALL' && log.category && log.category !== categoryFilter) {
        return false;
      }

      // 3. Severidade
      if (severityFilter !== 'ALL' && log.severity && log.severity !== severityFilter) {
        return false;
      }

      // 4. Sistema Operacional
      if (osFilter !== 'ALL' && log.device?.operatingSystem) {
        if (!log.device.operatingSystem.toLowerCase().includes(osFilter.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [auditLogs, search, categoryFilter, severityFilter, osFilter]);

  // Contadores analíticos imediatos
  const metrics = useMemo(() => {
    const total = auditLogs.length;
    const critical = auditLogs.filter((l: any) => l.severity === 'CRITICAL' || l.severity === 'HIGH').length;
    const authToday = auditLogs.filter((l: any) => l.category === 'AUTHENTICATION').length;
    const uniqueActors = new Set(auditLogs.map((l: any) => l.actor?.id || l.userId).filter(Boolean)).size;

    return { total, critical, authToday, uniqueActors };
  }, [auditLogs]);

  const columns: Column<AuditLogItem>[] = [
    {
      key: 'action',
      header: 'Ação & Categoria',
      render: (_, item: any) => {
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
            <span className="inline-block px-1.5 py-0.2 text-[10px] uppercase font-medium rounded bg-muted text-muted-foreground border border-border">
              {item.category || 'GERAL'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'actor',
      header: 'Ator Responsável',
      render: (_, item: any) => (
        <div className="text-xs space-y-0.5">
          <div className="font-medium text-foreground">
            {item.actor?.name || item.userName || 'Sistema Nora'}
          </div>
          <div className="text-[11px] text-muted-foreground truncate max-w-[160px]">
            {item.actor?.email || 'noreply@nora-audiovisual.ao'}
          </div>
        </div>
      ),
    },
    {
      key: 'organization',
      header: 'Produtora / Contexto',
      render: (_, item: any) => (
        <div className="text-xs space-y-0.5">
          <div className="font-medium text-foreground">
            {item.organization?.name || item.organizationName || 'Plataforma Global'}
          </div>
          <div className="text-[10px] font-mono text-muted-foreground">
            {item.organization?.slug ? `@${item.organization.slug}` : 'Sistema'}
          </div>
        </div>
      ),
    },
    {
      key: 'device',
      header: 'Dispositivo & IP',
      render: (_, item: any) => {
        const formatted = item.device?.formattedUserAgent || 'Dispositivo Padrão';
        const ip = item.network?.ip || item.ipAddress || '127.0.0.1';
        return (
          <div className="text-xs space-y-0.5">
            <div className="text-foreground truncate max-w-[180px] font-medium" title={formatted}>
              {formatted}
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">{ip}</div>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Data & Hora',
      render: (_, item: any) => (
        <span className="text-xs font-mono text-muted-foreground">
          {item.createdAt ? format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm:ss') : '—'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Investigação',
      render: (_, item: any) => (
        <button
          onClick={() => setSelectedEvent(item)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-border bg-muted/60 hover:bg-muted text-foreground transition-colors"
        >
          <Eye className="size-3.5 text-primary" />
          Inspecionar
        </button>
      ),
    },
  ];

  if (isLoadingAudit) {
    return <ListSkeleton rows={6} cols={5} />;
  }

  return (
    <div className="mt-6 space-y-6">
      {/* KPI Cards Rápidos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Eventos Registados
          </span>
          <p className="text-2xl font-semibold text-foreground">{metrics.total}</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-500">
            Críticos / Alta Severidade
          </span>
          <p className="text-2xl font-semibold text-foreground">{metrics.critical}</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Autenticação & Acessos
          </span>
          <p className="text-2xl font-semibold text-foreground">{metrics.authToday}</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Atores Distintos
          </span>
          <p className="text-2xl font-semibold text-foreground">{metrics.uniqueActors}</p>
        </div>
      </div>

      {/* Barra de Investigação Inteligente e Filtros */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <SearchHandlerWrapper
            search={search}
            setSearch={setSearch}
            placeholder="Pesquisar por ação, utilizador, produtora, IP ou Correlation ID..."
            className="w-full md:max-w-md"
          />

          {/* Mode Switcher: Tabela vs Timeline */}
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

        {/* Dropdowns de Filtro */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Categoria */}
          <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val)}>
            <SelectTrigger className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground min-w-[140px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value} className="text-xs">
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Severidade */}
          <Select value={severityFilter} onValueChange={(val) => setSeverityFilter(val)}>
            <SelectTrigger className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground min-w-[140px]">
              <SelectValue placeholder="Severidade" />
            </SelectTrigger>
            <SelectContent>
              {SEVERITIES.map((sev) => (
                <SelectItem key={sev.value} value={sev.value} className="text-xs">
                  {sev.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sistema Operacional */}
          <Select value={osFilter} onValueChange={(val) => setOsFilter(val)}>
            <SelectTrigger className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground min-w-[150px]">
              <SelectValue placeholder="Dispositivo / OS" />
            </SelectTrigger>
            <SelectContent>
              {OS_FILTERS.map((os) => (
                <SelectItem key={os.value} value={os.value} className="text-xs">
                  {os.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(categoryFilter !== 'ALL' || severityFilter !== 'ALL' || osFilter !== 'ALL' || search) && (
            <button
              onClick={() => {
                setCategoryFilter('ALL');
                setSeverityFilter('ALL');
                setOsFilter('ALL');
                setSearch('');
              }}
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Content Area: Table vs Timeline */}
      {filteredLogs.length > 0 ? (
        viewMode === 'TABLE' ? (
          <GenericTable<AuditLogItem>
            data={filteredLogs}
            columns={columns}
            total={filteredLogs.length}
            totalPages={Math.ceil(filteredLogs.length / 10) || 1}
            emptyMessage="Nenhum registo de auditoria encontrado"
          />
        ) : (
          <div className="p-6 rounded-xl border border-border bg-card/40">
            <AuditTimelineView
              logs={filteredLogs as InvestigativeAuditEvent[]}
              onSelectEvent={(event) => setSelectedEvent(event)}
            />
          </div>
        )
      ) : (
        <EmptyState
          title="Sem Registos"
          description={
            search || categoryFilter !== 'ALL' || severityFilter !== 'ALL'
              ? 'Nenhum evento encontrado com os filtros aplicados.'
              : 'Nenhum registo de auditoria disponível no sistema.'
          }
          icon="ShieldAlert"
        />
      )}

      {/* Drawer de Investigação Profunda */}
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
