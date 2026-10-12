'use client';

import { useMemo, useState } from 'react';
import { UniversalTable } from '@/components/custom/universal-table';
import {
  useServices,
  useUpdateService,
  useDeleteService,
} from '@/hooks/services';
import { useCategories } from '@/hooks/categories';
import { CatalogService } from '@/types';
import { useTenantStore } from '@/stores/tenant/tenant-store';

import { ServiceModal } from './service-modal';
import { ManageCategoriesModal } from '@/components/client/categories';
import { ServicesCatalogBanner } from './services-banner';
import { ServicesMetrics } from './services-metrics';
import { ServicesToolbar } from './services-toolbar';
import { ServicesGrid } from './services-grid';
import { createServicesColumns } from './services-columns';
import {
  buildCombinedCategoryOptions,
  STATUS_OPTIONS,
  SORT_OPTIONS,
} from './services-constants';

export function ServicesPageContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [selectedServiceToEdit, setSelectedServiceToEdit] =
    useState<CatalogService | null>(null);

  const { data: dbCategories = [] } = useCategories('SERVICE');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize] = useState(10);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: responseData, isLoading } = useServices();
  const { mutate: updateService } = useUpdateService();
  const { mutate: deleteService } = useDeleteService();

  const rawServices: CatalogService[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    if (responseData && Array.isArray((responseData as any).data)) {
      return (responseData as any).data;
    }
    return [];
  }, [responseData]);

  const combinedCategoryOptions = useMemo(() => {
    return buildCombinedCategoryOptions(dbCategories);
  }, [dbCategories]);

  const handleOpenCreate = () => {
    setSelectedServiceToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: CatalogService) => {
    setSelectedServiceToEdit(service);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (service: CatalogService) => {
    updateService({
      id: service.id,
      data: { isActive: !service.isActive },
    });
  };

  const handleDelete = (service: CatalogService) => {
    if (
      confirm(
        `Tem a certeza de que deseja remover o serviço "${service.name}" do catálogo?`,
      )
    ) {
      deleteService(service.id);
    }
  };

  // Filtragem e ordenação
  const filteredServices = useMemo(() => {
    let result = [...rawServices];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q),
      );
    }

    if (categoryFilter !== 'ALL') {
      result = result.filter((s) => s.category === categoryFilter);
    }

    if (statusFilter === 'ACTIVE') {
      result = result.filter((s) => s.isActive);
    } else if (statusFilter === 'INACTIVE') {
      result = result.filter((s) => !s.isActive);
    }

    result.sort((a, b) => {
      if (sortBy === 'price') {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      }
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [rawServices, search, categoryFilter, statusFilter, sortBy, sortOrder]);

  // Métricas
  const totalServices = rawServices.length;
  const activeServices = rawServices.filter((s) => s.isActive).length;
  const avgPrice =
    totalServices > 0
      ? rawServices.reduce((acc, curr) => acc + Number(curr.price), 0) /
        totalServices
      : 0;
  const categoriesCount = useMemo(() => {
    return new Set(rawServices.map((s) => s.category)).size;
  }, [rawServices]);

  const { activeOrganization } = useTenantStore();
  const orgSlug = activeOrganization?.slug || activeOrganization?.id || 'nora-studios';

  const columns = useMemo(() => {
    return createServicesColumns({
      onEdit: handleOpenEdit,
      onToggleStatus: handleToggleStatus,
      onDelete: handleDelete,
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner de Catálogo Público */}
      <ServicesCatalogBanner orgSlug={orgSlug} />

      {/* 4 Cards de Métricas */}
      <ServicesMetrics
        totalServices={totalServices}
        activeServices={activeServices}
        avgPrice={avgPrice}
        categoriesCount={categoriesCount}
      />

      {/* Toolbar Unificada com Pesquisa, Filtros e Ações */}
      <ServicesToolbar
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        categoryOptions={combinedCategoryOptions}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={STATUS_OPTIONS}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenManageCategories={() => setIsManageCategoriesOpen(true)}
        onOpenCreate={handleOpenCreate}
      />

      {/* Visualização em Grelha (Cards) */}
      {viewMode === 'grid' && (
        <ServicesGrid
          services={filteredServices}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          onCreateNew={handleOpenCreate}
        />
      )}

      {/* Visualização em Tabela */}
      {viewMode === 'list' && (
        <UniversalTable<CatalogService>
          data={filteredServices}
          columns={columns}
          isLoading={isLoading}
          searchKey="name"
          searchPlaceholder="Pesquisar por nome ou escopo..."
          searchValue={search}
          onSearchChange={setSearch}
          pageSize={pageSize}
          sortFilter={{
            options: SORT_OPTIONS,
            sortBy,
            sortOrder,
            onSortChange: (sb, so) => {
              setSortBy(sb);
              setSortOrder(so);
            },
          }}
          emptyState={{
            title: 'Nenhum serviço cadastrado',
            description:
              'Crie pacotes e serviços padronizados para acelerar propostas comerciais e solicitações no portal.',
          }}
        />
      )}

      {/* Modais de Gestão */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceToEdit={selectedServiceToEdit}
      />

      <ManageCategoriesModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
        type="SERVICE"
      />
    </div>
  );
}
