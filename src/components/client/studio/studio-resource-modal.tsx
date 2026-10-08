'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StudioResource, StudioResourceType } from '@/types';
import { useCreateStudioResource, useUpdateStudioResource } from '@/hooks/studio';
import { Building2, Layers, Users, Clock, CalendarCheck, MapPin } from 'lucide-react';

interface StudioResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource?: StudioResource | null;
}

const RESOURCE_TYPES: { value: StudioResourceType; label: string }[] = [
  { value: 'MAIN_STAGE', label: 'Palco Principal / Estúdio A' },
  { value: 'SOUND_BOOTH', label: 'Cabine de Som / Foley / Dobragem' },
  { value: 'CYCLORAMA', label: 'Ciclorama Infinito (Chroma / Branco)' },
  { value: 'EDIT_SUITE', label: 'Ilha de Edição & Color Grading' },
];

export function StudioResourceModal({
  isOpen,
  onClose,
  resource,
}: StudioResourceModalProps) {
  const isEditing = Boolean(resource?.id && !resource.id.startsWith('stage-') && !resource.id.startsWith('cyclo-') && !resource.id.startsWith('booth-') && !resource.id.startsWith('suite-'));
  // Note: if resource is a default demo one, allow saving as new or edit
  const isDemo = Boolean(resource?.id && (resource.id.startsWith('stage-') || resource.id.startsWith('cyclo-') || resource.id.startsWith('booth-') || resource.id.startsWith('suite-')));

  const [name, setName] = useState('');
  const [type, setType] = useState<StudioResourceType>('MAIN_STAGE');
  const [capacity, setCapacity] = useState<number>(10);
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [dailyRate, setDailyRate] = useState<number>(0);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'AVAILABLE' | 'MAINTENANCE'>('AVAILABLE');

  const { mutate: createResource, isPending: isCreating } = useCreateStudioResource();
  const { mutate: updateResource, isPending: isUpdating } = useUpdateStudioResource();

  useEffect(() => {
    if (resource && isOpen) {
      setName(resource.name || '');
      setType(resource.type || 'MAIN_STAGE');
      setCapacity(Number(resource.capacity) || 10);
      setHourlyRate(Number(resource.hourlyRate) || 0);
      setDailyRate(Number(resource.dailyRate) || 0);
      setLocation((resource as any).location || '');
      setDescription(resource.description || '');
      setStatus(resource.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'AVAILABLE');
    } else if (isOpen) {
      setName('');
      setType('MAIN_STAGE');
      setCapacity(10);
      setHourlyRate(0);
      setDailyRate(0);
      setLocation('');
      setDescription('');
      setStatus('AVAILABLE');
    }
  }, [resource, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      type,
      capacity: Number(capacity) || 1,
      hourlyRate: Number(hourlyRate) || 0,
      dailyRate: Number(dailyRate) || 0,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      status: status === 'AVAILABLE' ? 'ACTIVE' : 'MAINTENANCE',
    };

    if (resource?.id && !isDemo) {
      updateResource(
        { id: resource.id, data: payload as any },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    } else {
      createResource(payload as any, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl rounded-none border-border bg-card p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Building2 className="h-5 w-5" />
            <DialogTitle className="text-base font-semibold uppercase tracking-wider text-foreground">
              {resource ? (isDemo ? 'Personalizar Set (Salvar no Estúdio)' : 'Editar Set / Espaço') : 'Novo Set / Espaço de Gravação'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure as características acústicas, lotação, grelha técnica e tarifas do estúdio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Nome do Set */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">Nome do Set / Espaço *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Palco B (Soundstage 2) ou Cabine Foley"
              className="rounded-none border-border h-9 text-xs"
              required
            />
          </div>

          {/* Tipo e Lotação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Tipo de Espaço *</Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as StudioResourceType)}
                className="w-full h-9 rounded-none border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-muted-foreground" /> Lotação Máxima (Pax)
              </Label>
              <Input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                placeholder="Ex: 25"
                className="rounded-none border-border h-9 text-xs"
              />
            </div>
          </div>

          {/* Tarifas Horária e Diária */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Tarifa Horária (Kz)
              </Label>
              <Input
                type="number"
                min={0}
                step={500}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                placeholder="Ex: 35000"
                className="rounded-none border-border h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                <CalendarCheck className="h-3.5 w-3.5 text-muted-foreground" /> Tarifa Diária (Kz)
              </Label>
              <Input
                type="number"
                min={0}
                step={1000}
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
                placeholder="Ex: 250000"
                className="rounded-none border-border h-9 text-xs font-mono"
              />
            </div>
          </div>

          {/* Localização e Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Localização / Bloco
              </Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Pavilhão Sul, Piso 1"
                className="rounded-none border-border h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Estado Operacional</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-9 rounded-none border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="AVAILABLE">Disponível para Rodagem</option>
                <option value="MAINTENANCE">Em Manutenção Técnica</option>
              </select>
            </div>
          </div>

          {/* Descrição Técnica */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">Especificações Técnicas & Equipamentos</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o isolamento acústico, ar condicionado central, grelha DMX, consoles de som ou monitores calibrados instalados..."
              rows={3}
              className="rounded-none border-border text-xs resize-none"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-none text-xs h-9 border-border"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-9 font-medium tracking-wide uppercase px-4"
            >
              {isSaving ? 'A guardar...' : resource ? (isDemo ? 'Guardar como Novo Set' : 'Actualizar Set') : 'Criar Set'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
