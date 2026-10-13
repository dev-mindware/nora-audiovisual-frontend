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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InputCurrency } from '@/components/ui/input-currency';
import { StudioResource, OpeningHours } from '@/types';
import { OpeningHoursEditor } from './opening-hours-editor';
import { businessHoursPreset, findInvalidWindow, sanitizeOpeningHours } from '@/lib/opening-hours';
import { useCreateStudioResource, useUpdateStudioResource } from '@/hooks/studio';
import { Building2, Users, Clock, CalendarCheck, MapPin, Plus, Check } from 'lucide-react';

interface StudioResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource?: StudioResource | null;
}

const DEFAULT_RESOURCE_TYPES = [
  { value: 'MAIN_STAGE', label: 'Palco Principal / Estúdio A' },
  { value: 'SOUND_BOOTH', label: 'Cabine de Som / Foley / Dobragem' },
  { value: 'CYCLORAMA', label: 'Ciclorama Infinito (Chroma / Branco)' },
  { value: 'EDIT_SUITE', label: 'Ilha de Edição & Color Grading' },
];

const DEFAULT_STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Disponível para Rodagem' },
  { value: 'MAINTENANCE', label: 'Em Manutenção Técnica' },
];

export function StudioResourceModal({
  isOpen,
  onClose,
  resource,
}: StudioResourceModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('MAIN_STAGE');
  const [capacity, setCapacity] = useState<number>(10);
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [dailyRate, setDailyRate] = useState<number>(0);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>('AVAILABLE');
  const [openingHours, setOpeningHours] = useState<OpeningHours>(businessHoursPreset());

  // Custom types and statuses state
  const [customTypes, setCustomTypes] = useState<{ value: string; label: string }[]>([]);
  const [isAddingCustomType, setIsAddingCustomType] = useState(false);
  const [newTypeInput, setNewTypeInput] = useState('');

  const [customStatuses, setCustomStatuses] = useState<{ value: string; label: string }[]>([]);
  const [isAddingCustomStatus, setIsAddingCustomStatus] = useState(false);
  const [newStatusInput, setNewStatusInput] = useState('');

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
      setOpeningHours(resource.openingHours ?? businessHoursPreset());
    } else if (isOpen) {
      setName('');
      setType('MAIN_STAGE');
      setCapacity(10);
      setHourlyRate(0);
      setDailyRate(0);
      setLocation('');
      setDescription('');
      setStatus('AVAILABLE');
      setOpeningHours(businessHoursPreset());
      setIsAddingCustomType(false);
      setIsAddingCustomStatus(false);
    }
  }, [resource, isOpen]);

  const allTypes = [...DEFAULT_RESOURCE_TYPES, ...customTypes];
  const allStatuses = [...DEFAULT_STATUS_OPTIONS, ...customStatuses];

  const handleAddCustomType = () => {
    const trimmed = newTypeInput.trim();
    if (trimmed) {
      const code = trimmed.toUpperCase().replace(/\s+/g, '_');
      if (!allTypes.some((t) => t.value === code || t.label.toLowerCase() === trimmed.toLowerCase())) {
        setCustomTypes((prev) => [...prev, { value: code, label: trimmed }]);
      }
      setType(code);
      setNewTypeInput('');
      setIsAddingCustomType(false);
    }
  };

  const handleAddCustomStatus = () => {
    const trimmed = newStatusInput.trim();
    if (trimmed) {
      const code = trimmed.toUpperCase().replace(/\s+/g, '_');
      if (!allStatuses.some((s) => s.value === code || s.label.toLowerCase() === trimmed.toLowerCase())) {
        setCustomStatuses((prev) => [...prev, { value: code, label: trimmed }]);
      }
      setStatus(code);
      setNewStatusInput('');
      setIsAddingCustomStatus(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (findInvalidWindow(openingHours)) return;

    const payload = {
      name: name.trim(),
      type,
      capacity: Number(capacity) || 1,
      hourlyRate: Number(hourlyRate) || 0,
      dailyRate: Number(dailyRate) || 0,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      status: status === 'AVAILABLE' ? 'ACTIVE' : status,
      openingHours: sanitizeOpeningHours(openingHours),
    };

    if (resource?.id) {
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
      <DialogContent data-tour="studio-modal" className="max-w-xl rounded-xs border-border bg-card p-5 max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-1">
          <div className="flex items-center gap-2 text-primary">
            <Building2 className="h-5 w-5" />
            <DialogTitle className="text-base font-semibold uppercase tracking-wider text-foreground">
              {resource ? 'Editar Set / Espaço' : 'Novo Set / Espaço de Gravação'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure as características acústicas, lotação e tarifas do espaço.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1 overflow-y-auto pr-0.5">
          {/* Nome do Set */}
          <div className="space-y-1" data-tour="studio-name">
            <Label className="text-xs font-semibold text-foreground">Nome do Set / Espaço *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Palco B (Soundstage 2) ou Estúdio Podcast"
              className="rounded-xs border-border h-9 text-xs"
              required
            />
          </div>

          {/* Tipo de Espaço e Lotação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">Tipo de Espaço *</Label>
                <button
                  type="button"
                  onClick={() => setIsAddingCustomType((prev) => !prev)}
                  className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5"
                >
                  <Plus className="h-3 w-3" /> {isAddingCustomType ? 'Lista' : 'Novo Tipo'}
                </button>
              </div>

              {isAddingCustomType ? (
                <div className="flex gap-1.5">
                  <Input
                    placeholder="Ex: Estúdio Podcast"
                    value={newTypeInput}
                    onChange={(e) => setNewTypeInput(e.target.value)}
                    className="h-9 text-xs rounded-xs"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomType();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCustomType}
                    className="h-9 px-3 rounded-xs text-xs shrink-0"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <Select value={type} onValueChange={(val) => setType(val)}>
                  <SelectTrigger className="w-full h-9 rounded-xs border border-border bg-background px-3 text-xs text-foreground">
                    <SelectValue placeholder="Selecione o tipo de espaço" />
                  </SelectTrigger>
                  <SelectContent>
                    {allTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="text-xs">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Lotação Máxima com type="quantity" */}
            <div className="space-y-1">
              <Input
                type="quantity"
                label="Lotação Máxima (Pax)"
                value={capacity}
                onChange={(e: any) => setCapacity(Number(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* Tarifas Horária e Diária formatadas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-tour="studio-rates">
            <div className="space-y-1">
              <InputCurrency
                label="Tarifa Horária (Kz)"
                value={hourlyRate}
                onValueChange={(val) => setHourlyRate(val)}
                currency="Kz"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <InputCurrency
                label="Tarifa Diária (Kz)"
                value={dailyRate}
                onValueChange={(val) => setDailyRate(val)}
                currency="Kz"
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Localização e Estado Operacional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Localização / Bloco
              </Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Pavilhão Sul, Piso 1"
                className="rounded-xs border-border h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">Estado Operacional</Label>
                <button
                  type="button"
                  onClick={() => setIsAddingCustomStatus((prev) => !prev)}
                  className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5"
                >
                  <Plus className="h-3 w-3" /> {isAddingCustomStatus ? 'Lista' : 'Novo Estado'}
                </button>
              </div>

              {isAddingCustomStatus ? (
                <div className="flex gap-1.5">
                  <Input
                    placeholder="Ex: Em Montagem de Cenário"
                    value={newStatusInput}
                    onChange={(e) => setNewStatusInput(e.target.value)}
                    className="h-9 text-xs rounded-xs"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomStatus();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCustomStatus}
                    className="h-9 px-3 rounded-xs text-xs shrink-0"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <Select value={status} onValueChange={(val) => setStatus(val)}>
                  <SelectTrigger className="w-full h-9 rounded-xs border border-border bg-background px-3 text-xs text-foreground">
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {allStatuses.map((s) => (
                      <SelectItem key={s.value} value={s.value} className="text-xs">
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <OpeningHoursEditor value={openingHours} onChange={setOpeningHours} />

          {/* Descrição Técnica */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-foreground">Especificações Técnicas & Isolamento</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o isolamento acústico, ar condicionado central, grelha DMX, consolas..."
              rows={2}
              className="rounded-xs border-border text-xs resize-none"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xs text-xs h-9 border-border"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              data-tour="studio-save"
              disabled={isSaving}
              className="rounded-xs bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-9 font-medium tracking-wide px-4"
            >
              {isSaving ? 'A guardar...' : resource ? 'Actualizar Set' : 'Criar Set'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
