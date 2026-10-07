'use client';

import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  ItemStatusBadge,
  Button,
} from '@/components';
import {
  UniversalTable,
  MobileFilterBottomSheet,
  FilterSectionConfig,
  DateRangeFilter,
  SortFilter,
  SortOption,
} from '@/components/custom/universal-table';
import { FilterPopover } from '@/components/shared';
import { useEquipmentList, useEquipmentFilters } from '@/hooks/equipment';
import { Equipment } from '@/types';
import { EquipmentModal } from './equipment-modal';
import { ReservationModal } from './reservation-modal';
import { CheckoutModal } from './checkout-modal';
import { CheckinModal } from './checkin-modal';
import { Camera, Plus, Calendar, ArrowUpRight, ArrowDownLeft, MoreHorizontal, Filter, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'Todas as Categorias' },
  { value: 'CAMERA', label: 'Câmara' },
  { value: 'LENS', label: 'Lente / Óptica' },
  { value: 'LIGHTING', label: 'Iluminação' },
  { value: 'AUDIO', label: 'Áudio / Som' },
  { value: 'GRIP', label: 'Grip / Suporte' },
  { value: 'DRONE', label: 'Drone' },
  { value: 'ACCESSORY', label: 'Acessório' },
];

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Todos os Estados' },
  { value: 'AVAILABLE', label: 'Disponível' },
  { value: 'IN_USE', label: 'Em Rodagem' },
  { value: 'MAINTENANCE', label: 'Manutenção' },
  { value: 'RETIRED', label: 'Abatido' },
];

const SORT_OPTIONS: SortOption[] = [
  { value: 'createdAt', label: 'Data de Registo' },
  { value: 'name', label: 'Nome / Modelo' },
  { value: 'category', label: 'Categoria' },
  { value: 'dailyRate', label: 'Diária' },
  { value: 'status', label: 'Estado' },
];

export function EquipmentPageContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipmentForReservation, setSelectedEquipmentForReservation] = useState<Equipment | null>(null);
  const [selectedEquipmentForCheckout, setSelectedEquipmentForCheckout] = useState<Equipment | null>(null);
  const [selectedEquipmentForCheckin, setSelectedEquipmentForCheckin] = useState<Equipment | null>(null);

  const {
    filters,
    search,
    category,
    status,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    setSearch,
    setCategory,
    setStatus,
    setSort,
    setDateRange,
    resetFilters,
  } = useEquipmentFilters();

  const { data, isLoading } = useEquipmentList(filters);
  const equipmentList = data?.data || [];

  const columns: ColumnDef<Equipment>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Equipamento / Modelo',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none border border-border/70 bg-muted/30 text-foreground">
                <Camera className="h-4 w-4" />
              </div>
              <span className="font-semibold text-foreground text-sm tracking-tight">{item.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'serialNumber',
        header: 'Nº de Série / Tag',
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">
            {row.original.serialNumber || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Categoria',
        cell: ({ row }) => {
          const item = row.original;
          const catOption = CATEGORY_OPTIONS.find((c) => c.value === item.category);
          return (
            <span className="text-xs font-medium text-foreground">
              {catOption?.label || item.category}
            </span>
          );
        },
      },
      {
        accessorKey: 'location',
        header: 'Localização',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.location || 'Armazém Central'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => <ItemStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'dailyRate',
        header: 'Diária Interna',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <span className="text-xs text-foreground font-mono font-medium">
              {item.dailyRate ? `${Number(item.dailyRate).toLocaleString('pt-AO')} Kz` : '—'}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Acções',
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          const isAvail = item.status === 'AVAILABLE';
          const isInUse = item.status === 'IN_USE';

          if (!isAvail && !isInUse) {
            return <span className="text-xs text-muted-foreground">—</span>;
          }

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 sm:h-8 sm:w-8 p-0 min-h-[36px] min-w-[36px]">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAvail && (
                  <>
                    <DropdownMenuItem onClick={() => setSelectedEquipmentForReservation(item)}>
                      <Calendar className="mr-2 h-4 w-4" /> Reservar para Rodagem
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedEquipmentForCheckout(item)}>
                      <ArrowUpRight className="mr-2 h-4 w-4" /> Guia de Saída (Check-out)
                    </DropdownMenuItem>
                  </>
                )}
                {isInUse && (
                  <DropdownMenuItem onClick={() => setSelectedEquipmentForCheckin(item)}>
                    <ArrowDownLeft className="mr-2 h-4 w-4" /> Devolução (Check-in)
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  // Configuração das secções para o MobileFilterBottomSheet
  const mobileSections: FilterSectionConfig[] = useMemo(
    () => [
      {
        id: 'category',
        title: 'Categoria de Equipamento',
        options: CATEGORY_OPTIONS.filter((c) => c.value !== 'ALL').map((c) => ({
          label: c.label,
          value: c.value,
        })),
        multiple: false,
      },
      {
        id: 'status',
        title: 'Estado do Equipamento',
        options: STATUS_OPTIONS.filter((s) => s.value !== 'ALL').map((s) => ({
          label: s.label,
          value: s.value,
        })),
        multiple: false,
      },
    ],
    []
  );

  const appliedMobileFilters: Record<string, string[]> = useMemo(
    () => ({
      category: category && category !== 'ALL' ? [category] : [],
      status: status && status !== 'ALL' ? [status] : [],
    }),
    [category, status]
  );

  const handleApplyMobileFilters = (newFilters: Record<string, string[]>) => {
    const nextCategory = newFilters.category?.[0] || 'ALL';
    const nextStatus = newFilters.status?.[0] || 'ALL';
    setCategory(nextCategory);
    setStatus(nextStatus);
  };

  return (
    <div className="mt-6 space-y-6">
      {/* UniversalTable Unificada - Barra Única sem Repetições */}
      <UniversalTable<Equipment>
        data={equipmentList}
        columns={columns}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Pesquisar por modelo, número de série ou nome..."
        searchValue={search}
        onSearchChange={setSearch}
        pageSize={filters.limit || 10}
        customFilters={
          <>
            <FilterPopover
              icon="Tag"
              label="Categoria"
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={(val) => setCategory(val || 'ALL')}
            />
            <FilterPopover
              icon="CircleDot"
              label="Estado"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(val) => setStatus(val || 'ALL')}
            />
          </>
        }
        mobileSections={mobileSections}
        appliedMobileFilters={appliedMobileFilters}
        onApplyMobileFilters={(newFilters, extra) => {
          handleApplyMobileFilters(newFilters);
          if (extra?.sortBy && extra?.sortOrder) {
            setSort(extra.sortBy, extra.sortOrder);
          }
          if (extra?.startDate !== undefined || extra?.endDate !== undefined) {
            setDateRange(extra.startDate, extra.endDate);
          }
        }}
        onClearFilters={resetFilters}
        sortFilter={{
          options: SORT_OPTIONS,
          sortBy,
          sortOrder,
          onSortChange: (sb, so) => setSort(sb, so),
        }}
        dateRangeFilter={{
          startDate,
          endDate,
          onChange: (start, end) => setDateRange(start, end),
        }}
        toolbar={{
          actions: (
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="h-10 sm:h-9 min-h-[44px] sm:min-h-0 text-xs gap-1.5 shrink-0 rounded-none px-3.5"
            >
              <Plus className="h-4 w-4" /> Novo Equipamento
            </Button>
          ),
        }}
        emptyState={{
          title: 'Sem Equipamento',
          description:
            search || category !== 'ALL' || status !== 'ALL'
              ? 'Nenhum equipamento encontrado com os filtros seleccionados.'
              : 'Adicione equipamento técnico ao inventário para começar.',
          action: (
            <Button size="sm" onClick={() => setIsModalOpen(true)} className="text-xs min-h-[44px] sm:min-h-0">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Adicionar Primeiro Item
            </Button>
          ),
        }}
      />

      <EquipmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {selectedEquipmentForReservation && (
        <ReservationModal
          equipment={selectedEquipmentForReservation}
          isOpen={Boolean(selectedEquipmentForReservation)}
          onClose={() => setSelectedEquipmentForReservation(null)}
        />
      )}
      {selectedEquipmentForCheckout && (
        <CheckoutModal
          equipment={selectedEquipmentForCheckout}
          isOpen={Boolean(selectedEquipmentForCheckout)}
          onClose={() => setSelectedEquipmentForCheckout(null)}
        />
      )}
      {selectedEquipmentForCheckin && (
        <CheckinModal
          equipment={selectedEquipmentForCheckin}
          isOpen={Boolean(selectedEquipmentForCheckin)}
          onClose={() => setSelectedEquipmentForCheckin(null)}
        />
      )}
    </div>
  );
}
