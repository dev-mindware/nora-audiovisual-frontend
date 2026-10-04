'use client';

import { useState, useMemo } from 'react';
import {
  GenericTable,
  Column,
  ListSkeleton,
  EmptyState,
  SearchHandlerWrapper,
} from '@/components';
import { useAdmin } from '@/hooks/admin';
import { AuditLogItem } from '@/services/admin-service';
import { format } from 'date-fns';

export function AdminAuditPageContent() {
  const { auditLogs, isLoadingAudit } = useAdmin();
  const [search, setSearch] = useState('');

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return auditLogs;
    const q = search.toLowerCase();
    return auditLogs.filter(
      (log) =>
        log.action?.toLowerCase().includes(q) ||
        log.organizationName?.toLowerCase().includes(q) ||
        log.userName?.toLowerCase().includes(q) ||
        log.ipAddress?.toLowerCase().includes(q)
    );
  }, [auditLogs, search]);

  const columns: Column<AuditLogItem>[] = [
    {
      key: 'action',
      header: 'Ação',
      render: (_, item) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {item.action}
        </span>
      ),
    },
    {
      key: 'organizationName',
      header: 'Produtora / Contexto',
      render: (_, item) => (
        <span className="text-xs text-foreground font-medium">
          {item.organizationName || 'Plataforma Global'}
        </span>
      ),
    },
    {
      key: 'userName',
      header: 'Utilizador',
      render: (_, item) => (
        <span className="text-xs text-muted-foreground">{item.userName || 'Sistema'}</span>
      ),
    },
    {
      key: 'ipAddress',
      header: 'Endereço IP',
      render: (_, item) => (
        <span className="text-xs font-mono text-muted-foreground">
          {item.ipAddress || '127.0.0.1'}
        </span>
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
  ];

  if (isLoadingAudit) {
    return <ListSkeleton rows={5} cols={5} />;
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Filters (Exact Mindgest Pattern) */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-baseline">
        <SearchHandlerWrapper
          search={search}
          setSearch={setSearch}
          placeholder="Pesquisar por ação, utilizador, produtora ou IP..."
          className="w-full sm:max-w-md"
        />
      </div>

      {/* Table (Directly rendered, NOT in a card) */}
      {filteredLogs.length > 0 ? (
        <GenericTable<AuditLogItem>
          data={filteredLogs}
          columns={columns}
          total={filteredLogs.length}
          totalPages={Math.ceil(filteredLogs.length / 10) || 1}
          emptyMessage="Nenhum registo de auditoria encontrado"
        />
      ) : (
        <EmptyState
          title="Sem Registos"
          description={
            search
              ? 'Nenhum evento encontrado com os termos de pesquisa.'
              : 'Nenhum registo de auditoria no sistema.'
          }
          icon="ShieldAlert"
        />
      )}
    </div>
  );
}
