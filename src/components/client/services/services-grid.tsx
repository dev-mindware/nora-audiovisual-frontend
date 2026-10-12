'use client';

import { CatalogService } from '@/types';
import { Button } from '@/components';
import { Briefcase, Plus } from 'lucide-react';
import { ServiceCard } from './service-card';

interface ServicesGridProps {
  services: CatalogService[];
  isLoading: boolean;
  onEdit: (service: CatalogService) => void;
  onToggleStatus: (service: CatalogService) => void;
  onDelete: (service: CatalogService) => void;
  onCreateNew: () => void;
}

export function ServicesGrid({
  services,
  isLoading,
  onEdit,
  onToggleStatus,
  onDelete,
  onCreateNew,
}: ServicesGridProps) {
  if (services.length === 0 && !isLoading) {
    return (
      <div className="py-14 text-center border border-dashed border-border rounded-xs bg-muted/10 p-8">
        <Briefcase className="h-9 w-9 text-muted-foreground mx-auto mb-2.5 opacity-50" />
        <h3 className="text-sm font-semibold text-foreground">
          Nenhum serviço encontrado no catálogo
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Adicione pacotes como Videoclipes, Spots Comerciais ou Diárias de Estúdio para visualização e contratação.
        </p>
        <Button
          onClick={onCreateNew}
          size="sm"
          className="mt-4 gap-1.5 rounded-xs text-xs h-9"
        >
          <Plus className="h-4 w-4" /> Criar Primeiro Serviço
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
