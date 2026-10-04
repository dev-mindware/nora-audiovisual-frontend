'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { NOTION_KANBAN_COLORS, KANBAN_CATEGORIES_METADATA } from '@/constants/kanban';
import {
  OrganizationKanbanColumn,
  KanbanCategory,
  NotionKanbanColor,
} from '@/types';
import { Check, Sliders, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditColumnDialogProps {
  column: OrganizationKanbanColumn | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (columnId: string, payload: {
    name: string;
    category?: KanbanCategory;
    color?: NotionKanbanColor;
    wipLimit?: number | null;
    isDefault?: boolean;
  }) => Promise<any>;
  onArchive?: (column: OrganizationKanbanColumn) => void;
  canArchive?: boolean;
}

export function EditColumnDialog({
  column,
  open,
  onOpenChange,
  onSave,
  onArchive,
  canArchive = false,
}: EditColumnDialogProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<KanbanCategory>('TODO');
  const [color, setColor] = useState<NotionKanbanColor>('gray');
  const [enableWip, setEnableWip] = useState(false);
  const [wipLimit, setWipLimit] = useState<string>('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (column) {
      setName(column.name);
      setCategory(column.category);
      setColor(column.color as NotionKanbanColor);
      setEnableWip(!!column.wipLimit);
      setWipLimit(column.wipLimit ? String(column.wipLimit) : '');
      setIsDefault(column.isDefault);
    }
  }, [column, open]);

  if (!column) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('O nome da coluna é obrigatório.');
      return;
    }

    let parsedWip: number | null = null;
    if (enableWip) {
      parsedWip = parseInt(wipLimit, 10);
      if (isNaN(parsedWip) || parsedWip < 1) {
        toast.error('O limite WIP deve ser um número inteiro superior a zero.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSave(column.id, {
        name: name.trim(),
        category,
        color,
        wipLimit: parsedWip,
        isDefault: category === 'TODO' ? isDefault : false,
      });
      onOpenChange(false);
    } catch {
      // toast gerido pela mutação
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-none border-border">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Personalizar Coluna Kanban
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Edite o nome, categoria semântica, cor Notion e limites de trabalho simultâneo (WIP).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nome da Coluna */}
            <div className="space-y-1.5">
              <Label htmlFor="col-name" className="text-xs font-medium">
                Nome da Coluna *
              </Label>
              <Input
                id="col-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Em Filmagem, Revisão do Diretor..."
                className="rounded-none text-xs h-9"
                required
                autoFocus
              />
            </div>

            {/* Categoria Semântica Notion */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Categoria Semântica</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['TODO', 'IN_PROGRESS', 'DONE'] as KanbanCategory[]).map((cat) => {
                  const meta = KANBAN_CATEGORIES_METADATA[cat];
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`flex flex-col items-center justify-center p-2.5 border rounded-none text-left transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-foreground font-semibold ring-1 ring-primary'
                          : 'border-border bg-card hover:bg-muted/40 text-muted-foreground'
                      }`}
                    >
                      <span className="text-xs">{meta.label}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                        {cat === 'TODO' ? 'Entrada' : cat === 'IN_PROGRESS' ? 'Execução' : 'Entrega'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cores Estilo Notion */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Cor de Identificação</Label>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(NOTION_KANBAN_COLORS) as NotionKanbanColor[]).map((cKey) => {
                  const cStyle = NOTION_KANBAN_COLORS[cKey];
                  const isSelected = color === cKey;
                  return (
                    <button
                      key={cKey}
                      type="button"
                      onClick={() => setColor(cKey)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 border text-xs rounded-none transition-all ${cStyle.bg} ${cStyle.text} ${cStyle.border} ${
                        isSelected ? 'ring-2 ring-foreground/40 font-semibold' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${cStyle.dot}`} />
                      <span className="truncate">{cStyle.label}</span>
                      {isSelected && <Check className="h-3 w-3 ml-auto text-foreground" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Limite de Trabalho em Curso (WIP Limit) */}
            <div className="space-y-3 border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="toggle-wip" className="text-xs font-medium cursor-pointer">
                    Ativar Limite WIP (Work in Progress)
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Alerta a equipa quando a coluna tiver tarefas a mais em simultâneo.
                  </p>
                </div>
                <Switch
                  id="toggle-wip"
                  checked={enableWip}
                  onCheckedChange={setEnableWip}
                />
              </div>

              {enableWip && (
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-32">
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      value={wipLimit}
                      onChange={(e) => setWipLimit(e.target.value)}
                      placeholder="Ex: 5"
                      className="rounded-none text-xs h-8"
                      required={enableWip}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    tarefas simultâneas máximas permitidas
                  </span>
                </div>
              )}
            </div>

            {/* Coluna Padrão para novas tarefas (Apenas TODO) */}
            {category === 'TODO' && (
              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="space-y-0.5">
                  <Label htmlFor="toggle-default" className="text-xs font-medium cursor-pointer">
                    Coluna Padrão de Entrada
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Novas tarefas criadas no projeto entrarão automaticamente nesta coluna.
                  </p>
                </div>
                <Switch
                  id="toggle-default"
                  checked={isDefault}
                  onCheckedChange={setIsDefault}
                  disabled={column.isDefault} // Se já for a padrão ativa, não desativar diretamente sem marcar outra
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between border-t border-border pt-3">
            {onArchive && canArchive && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onArchive(column);
                }}
                className="rounded-none text-xs h-8"
              >
                Arquivar Coluna
              </Button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="rounded-none text-xs h-8 border-border"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="rounded-none text-xs h-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> A Guardar...
                  </>
                ) : (
                  'Guardar Alterações'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
