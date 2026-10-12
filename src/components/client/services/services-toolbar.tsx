'use client';

import { Button, Input } from '@/components/ui';
import { FilterPopover } from '@/components/shared';
import { Plus, Tags, LayoutGrid, List } from 'lucide-react';

interface ServicesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categoryOptions: { value: string; label: string }[];
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  statusOptions: { value: string; label: string }[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onOpenManageCategories: () => void;
  onOpenCreate: () => void;
}

export function ServicesToolbar({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  viewMode,
  onViewModeChange,
  onOpenManageCategories,
  onOpenCreate,
}: ServicesToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
      {/* Pesquisa e Filtros */}
      <div className="flex items-center gap-2 flex-wrap flex-1">
        <div className="w-full sm:w-64">
          <Input
            placeholder="Pesquisar pacote ou escopo..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <FilterPopover
          icon="Tag"
          label="Categoria"
          options={categoryOptions}
          value={categoryFilter}
          onChange={(val) => onCategoryFilterChange(val || 'ALL')}
        />

        <FilterPopover
          icon="Eye"
          label="Visibilidade"
          options={statusOptions}
          value={statusFilter}
          onChange={(val) => onStatusFilterChange(val || 'ALL')}
        />
      </div>

      {/* Ações e Modo de Visualização */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center border border-border rounded-xs p-0.5 bg-muted/20">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="text-xs h-7 px-2.5 rounded-xs gap-1.5"
            title="Visualização em Grelha de Cards"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cards</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="text-xs h-7 px-2.5 rounded-xs gap-1.5"
            title="Visualização em Tabela"
          >
            <List className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tabela</span>
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenManageCategories}
          className="text-xs h-8 gap-1.5 rounded-xs"
        >
          <Tags className="h-3.5 w-3.5" />
          <span>Categorias</span>
        </Button>

        <Button
          onClick={onOpenCreate}
          size="sm"
          className="text-xs h-8 gap-1.5 rounded-xs bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Novo Serviço</span>
        </Button>
      </div>
    </div>
  );
}
