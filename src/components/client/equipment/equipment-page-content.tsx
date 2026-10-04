'use client';

import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  ItemStatusBadge,
  Button,
} from '@/components';
import { UniversalTable } from '@/components/custom/universal-table';
import { FilterPopover } from '@/components/shared';
import { useEquipmentList, useEquipmentFilters } from '@/hooks/equipment';
import { Equipment } from '@/types';
import { EquipmentModal } from './equipment-modal';
import { ReservationModal } from './reservation-modal';
import { CheckoutModal } from './checkout-modal';
import { CheckinModal } from './checkin-modal';
import { Camera, Plus, Calendar, ArrowUpRight, ArrowDownLeft, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'Todas as Categorias' },
  { value: 'CAMERA', label: 'Câmara' },
  { value: 'LENS', label: 'Lente / Ótica' },
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
    setSearch,
    setCategory,
    setStatus,
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
        header: 'Ação',
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
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                      <ArrowUpRight className="mr-2 h-4 w-4" /> Check-out de Saída
                    </DropdownMenuItem>
                  </>
                )}
                {isInUse && (
                  <DropdownMenuItem onClick={() => setSelectedEquipmentForCheckin(item)}>
                    <ArrowDownLeft className="mr-2 h-4 w-4" /> Check-in de Devolução
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

  return (
    <div className="mt-6 space-y-6">
      {/* Mindgest Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-baseline">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
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
          {(category !== 'ALL' || status !== 'ALL' || search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-muted-foreground hover:text-foreground h-9"
            >
              Limpar filtros
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="h-10 text-xs gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" /> Novo Equipamento
          </Button>
        </div>
      </div>

      {/* UniversalTable */}
      <UniversalTable<Equipment>
        data={equipmentList}
        columns={columns}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Pesquisar por modelo, número de série ou nome..."
        pageSize={filters.limit || 10}
        emptyState={{
          title: 'Sem Equipamento',
          description:
            search || category !== 'ALL' || status !== 'ALL'
              ? 'Nenhum equipamento encontrado com os filtros selecionados.'
              : 'Adicione equipamento técnico ao inventário para começar.',
          action: (
            <Button size="sm" onClick={() => setIsModalOpen(true)} className="text-xs">
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
