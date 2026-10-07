'use client';

import { useState, useMemo } from 'react';
import { useOrganizationKanbanSettings } from '@/hooks/use-organization-kanban-settings';
import { NOTION_KANBAN_COLORS, KANBAN_CATEGORIES_METADATA } from '@/constants/kanban';
import {
  KanbanCategory,
  NotionKanbanColor,
  OrganizationKanbanColumn,
  CardProperties,
} from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  RotateCcw,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Archive,
  Star,
  Layers,
  Eye,
  Sliders,
  AlertTriangle,
  Loader2,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { EditColumnDialog } from '@/components/client/kanban/edit-column-dialog';

export function KanbanSettingsTab() {
  const {
    columns,
    settings,
    isLoading,
    createColumn,
    updateColumn,
    reorderColumns,
    archiveColumn,
    updateCardProperties,
    resetToDefault,
    isCreating,
    isUpdating,
    isReordering,
    isArchiving,
    isUpdatingCardProperties,
    isResetting,
  } = useOrganizationKanbanSettings();

  // Modals state
  const [editTargetColumn, setEditTargetColumn] = useState<OrganizationKanbanColumn | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createCategory, setCreateCategory] = useState<KanbanCategory>('TODO');
  const [createName, setCreateName] = useState('');
  const [createColor, setCreateColor] = useState<NotionKanbanColor>('gray');
  const [createWip, setCreateWip] = useState<string>('');

  const [archiveTargetColumn, setArchiveTargetColumn] = useState<OrganizationKanbanColumn | null>(null);
  const [selectedFallbackId, setSelectedFallbackId] = useState<string>('');

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Active columns sorted strictly by position
  const sortedColumns = useMemo(() => {
    return [...columns].sort((a, b) => a.position - b.position);
  }, [columns]);

  const columnsByCategory = useMemo(() => {
    const acc: Record<KanbanCategory, OrganizationKanbanColumn[]> = {
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
    };
    sortedColumns.forEach((col) => {
      if (acc[col.category]) {
        acc[col.category].push(col);
      }
    });
    return acc;
  }, [sortedColumns]);

  const handleOpenCreate = (category?: KanbanCategory) => {
    setCreateCategory(category || 'IN_PROGRESS');
    setCreateName('');
    setCreateColor('blue');
    setCreateWip('');
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      toast.error('Informe o nome da coluna.');
      return;
    }

    try {
      await createColumn({
        name: createName.trim(),
        category: createCategory,
        color: createColor,
        wipLimit: createWip ? parseInt(createWip, 10) : null,
      });
      setIsCreateOpen(false);
    } catch {
      // toast já disparado no hook
    }
  };

  const handleMoveColumn = async (columnId: string, direction: 'up' | 'down') => {
    const sorted = [...columns].sort((a, b) => a.position - b.position);
    const currentIndex = sorted.findIndex((c) => c.id === columnId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    // Swap positions
    const newOrder = [...sorted];
    const temp = newOrder[currentIndex];
    newOrder[currentIndex] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    await reorderColumns(newOrder.map((c) => c.id));
  };

  const handleColorChange = async (columnId: string, color: NotionKanbanColor) => {
    await updateColumn({
      columnId,
      payload: { color },
    });
  };

  const handleSetDefault = async (columnId: string) => {
    await updateColumn({
      columnId,
      payload: { isDefault: true },
    });
  };

  const handleOpenArchive = (col: OrganizationKanbanColumn) => {
    if (col.isDefault) {
      toast.error('A coluna padrão de criação de tarefas não pode ser arquivada.');
      return;
    }

    const inCat = columnsByCategory[col.category];
    if (inCat.length <= 1) {
      toast.error(`Não é possível arquivar a última coluna da categoria "${KANBAN_CATEGORIES_METADATA[col.category].label}".`);
      return;
    }

    // Default fallback to another active column in the same category or general
    const candidates = columns.filter((c) => c.id !== col.id);
    const sameCat = candidates.find((c) => c.category === col.category);
    setSelectedFallbackId(sameCat ? sameCat.id : candidates[0]?.id || '');

    setArchiveTargetColumn(col);
  };

  const handleArchiveConfirm = async () => {
    if (!archiveTargetColumn) return;

    try {
      await archiveColumn({
        columnId: archiveTargetColumn.id,
        targetColumnId: archiveTargetColumn.taskCount && archiveTargetColumn.taskCount > 0 ? selectedFallbackId : undefined,
      });
      setArchiveTargetColumn(null);
    } catch {
      // toast já disparado no hook
    }
  };

  const handleToggleCardProperty = async (propKey: keyof CardProperties) => {
    if (!settings) return;
    const currentVal = settings.cardProperties?.[propKey] ?? true;
    await updateCardProperties({
      version: settings.version,
      cardProperties: {
        [propKey]: !currentVal,
      },
    });
  };

  const handleToggleHideEmpty = async (checked: boolean) => {
    if (!settings) return;
    await updateCardProperties({
      version: settings.version,
      hideEmptyColumns: checked,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Carregando configurações do Kanban...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card className="rounded-none border-border shadow-none">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Fluxo de Trabalho &amp; Kanban da Produtora
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Defina as colunas, categorias do Notion, limites WIP e dados exibidos nos cartões de todos os projectos.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetConfirmOpen(true)}
              disabled={isResetting}
              className="rounded-none text-xs gap-1.5 h-8 border-border"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restaurar Padrão
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between py-2 border-t border-border">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium flex items-center gap-1.5 cursor-pointer" htmlFor="hide-empty">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                Ocultar colunas vazias no quadro geral
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Colunas sem nenhuma tarefa não serão exibidas no quadro até receberem cartões (padrão Notion).
              </p>
            </div>
            <Switch
              id="hide-empty"
              checked={settings?.hideEmptyColumns || false}
              onCheckedChange={handleToggleHideEmpty}
              disabled={isUpdatingCardProperties}
              className="rounded-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Columns Section */}
      <div className="space-y-6">
        {(['TODO', 'IN_PROGRESS', 'DONE'] as KanbanCategory[]).map((categoryKey) => {
          const categoryMeta = KANBAN_CATEGORIES_METADATA[categoryKey];
          const categoryCols = columnsByCategory[categoryKey] || [];

          return (
            <Card key={categoryKey} className="rounded-none border-border shadow-none">
              <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/30">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs tracking-wider uppercase text-foreground">
                      {categoryMeta.label}
                    </span>
                    <Badge variant="outline" className="rounded-none text-[10px] font-mono px-1.5 py-0 h-4">
                      {categoryCols.length} {categoryCols.length === 1 ? 'coluna' : 'colunas'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {categoryMeta.description}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenCreate(categoryKey)}
                  disabled={columns.length >= 12 || isCreating}
                  className="rounded-none text-xs gap-1 h-7 border-border"
                >
                  <Plus className="h-3 w-3" />
                  Nova Coluna
                </Button>
              </CardHeader>

              <CardContent className="p-0 divide-y divide-border">
                {categoryCols.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    Nenhuma coluna nesta categoria.
                  </div>
                ) : (
                  categoryCols.map((col, idx) => {
                    const colorStyle = NOTION_KANBAN_COLORS[col.color] || NOTION_KANBAN_COLORS.gray;
                    const canMoveUp = idx > 0 || categoryKey !== 'TODO';
                    const canMoveDown = idx < categoryCols.length - 1 || categoryKey !== 'DONE';

                    return (
                      <div
                        key={col.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 hover:bg-muted/10 transition-colors"
                      >
                        {/* Left: Reorder, Color Tag, Name */}
                        <div className="flex items-center gap-3">
                          {/* Reordering arrows */}
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleMoveColumn(col.id, 'up')}
                              disabled={isReordering}
                              className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"
                              title="Mover para cima"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveColumn(col.id, 'down')}
                              disabled={isReordering}
                              className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"
                              title="Mover para baixo"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Color Dropdown Pill */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className={`flex items-center gap-1.5 px-2 py-0.5 text-xs border ${colorStyle.bg} ${colorStyle.text} ${colorStyle.border} rounded-none cursor-pointer hover:opacity-90 transition-opacity`}
                              >
                                <span className={`h-2 w-2 rounded-full ${colorStyle.dot}`} />
                                <span className="font-medium text-[11px]">{colorStyle.label}</span>
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="rounded-none w-44">
                              <DropdownMenuLabel className="text-[11px] font-medium text-muted-foreground">
                                Cores do Notion
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {(Object.keys(NOTION_KANBAN_COLORS) as NotionKanbanColor[]).map((cKey) => {
                                const opt = NOTION_KANBAN_COLORS[cKey];
                                const isSelected = col.color === cKey;
                                return (
                                  <DropdownMenuItem
                                    key={cKey}
                                    onClick={() => handleColorChange(col.id, cKey)}
                                    className="text-xs flex items-center justify-between cursor-pointer rounded-none"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className={`h-2.5 w-2.5 rounded-full ${opt.dot}`} />
                                      <span>{opt.label}</span>
                                    </div>
                                    {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* Column Title and Badges */}
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-xs text-foreground">{col.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">({col.slug})</span>

                            {col.isDefault && (
                              <Badge
                                variant="secondary"
                                className="rounded-none text-[10px] gap-1 px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20"
                              >
                                <Star className="h-2.5 w-2.5 fill-primary" />
                                Padrão
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Right: WIP limit, Tasks count, Actions */}
                        <div className="flex items-center gap-3">
                          {/* WIP Limit Indicator */}
                          {col.wipLimit ? (
                            <Badge variant="outline" className="rounded-none text-[11px] border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                              Limite: {col.wipLimit} tarefas
                            </Badge>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">Sem limite WIP</span>
                          )}

                          <Badge variant="outline" className="rounded-none text-[11px] px-2">
                            {col.taskCount ?? 0} {col.taskCount === 1 ? 'tarefa' : 'tarefas'}
                          </Badge>

                          {/* Action Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-none w-48">
                              {categoryKey === 'TODO' && !col.isDefault && (
                                <DropdownMenuItem
                                  onClick={() => handleSetDefault(col.id)}
                                  className="text-xs cursor-pointer rounded-none gap-2"
                                >
                                  <Star className="h-3.5 w-3.5 text-amber-500" />
                                  Definir como Padrão
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                onClick={() => setEditTargetColumn(col)}
                                className="text-xs cursor-pointer rounded-none gap-2 font-medium"
                              >
                                <Sliders className="h-3.5 w-3.5 text-primary" />
                                Personalizar &amp; Renomear
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => handleOpenArchive(col)}
                                disabled={col.isDefault || categoryCols.length <= 1}
                                className="text-xs text-destructive focus:text-destructive cursor-pointer rounded-none gap-2"
                              >
                                <Archive className="h-3.5 w-3.5" />
                                Arquivar Coluna
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Card Properties Visibility Section */}
      <Card className="rounded-none border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" />
            Propriedades Exibidas no Cartão (Card Properties)
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Escolha que informações devem aparecer na face dos cartões do quadro Kanban.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 divide-y divide-border">
          <div className="flex items-center justify-between py-2.5">
            <div>
              <Label className="text-xs font-medium cursor-pointer" onClick={() => handleToggleCardProperty('assignee')}>
                Membro Responsável / Atribuído a
              </Label>
              <p className="text-[11px] text-muted-foreground">Exibe o avatar e nome do utilizador responsável</p>
            </div>
            <Switch
              checked={settings?.cardProperties?.assignee ?? true}
              onCheckedChange={() => handleToggleCardProperty('assignee')}
              disabled={isUpdatingCardProperties}
              className="rounded-none"
            />
          </div>

          <div className="flex items-center justify-between py-2.5">
            <div>
              <Label className="text-xs font-medium cursor-pointer" onClick={() => handleToggleCardProperty('priority')}>
                Badge de Prioridade
              </Label>
              <p className="text-[11px] text-muted-foreground">Exibe indicador de urgência (Baixa, Média, Alta, Urgente)</p>
            </div>
            <Switch
              checked={settings?.cardProperties?.priority ?? true}
              onCheckedChange={() => handleToggleCardProperty('priority')}
              disabled={isUpdatingCardProperties}
              className="rounded-none"
            />
          </div>

          <div className="flex items-center justify-between py-2.5">
            <div>
              <Label className="text-xs font-medium cursor-pointer" onClick={() => handleToggleCardProperty('department')}>
                Departamento Técnico
              </Label>
              <p className="text-[11px] text-muted-foreground">Exibe tag de área (Câmara, Iluminação, Som, Montagem, etc.)</p>
            </div>
            <Switch
              checked={settings?.cardProperties?.department ?? true}
              onCheckedChange={() => handleToggleCardProperty('department')}
              disabled={isUpdatingCardProperties}
              className="rounded-none"
            />
          </div>

          <div className="flex items-center justify-between py-2.5">
            <div>
              <Label className="text-xs font-medium cursor-pointer" onClick={() => handleToggleCardProperty('dueDate')}>
                Data de Entrega / Prazo
              </Label>
              <p className="text-[11px] text-muted-foreground">Exibe data limite e alerta visual em caso de atraso</p>
            </div>
            <Switch
              checked={settings?.cardProperties?.dueDate ?? true}
              onCheckedChange={() => handleToggleCardProperty('dueDate')}
              disabled={isUpdatingCardProperties}
              className="rounded-none"
            />
          </div>

          <div className="flex items-center justify-between py-2.5">
            <div>
              <Label className="text-xs font-medium cursor-pointer" onClick={() => handleToggleCardProperty('estimatedHours')}>
                Horas Estimadas de Produção
              </Label>
              <p className="text-[11px] text-muted-foreground">Exibe a estimativa de tempo prevista para a tarefa</p>
            </div>
            <Switch
              checked={settings?.cardProperties?.estimatedHours ?? false}
              onCheckedChange={() => handleToggleCardProperty('estimatedHours')}
              disabled={isUpdatingCardProperties}
              className="rounded-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Modal: Create Column */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="rounded-none sm:max-w-md">
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Nova Coluna no Kanban</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Adicione um novo estágio na categoria &quot;{KANBAN_CATEGORIES_METADATA[createCategory].label}&quot;.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="col-name" className="text-xs">Nome da Coluna</Label>
                <Input
                  id="col-name"
                  placeholder="Ex: Correção de Cor, Gravação B-Roll..."
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  maxLength={60}
                  className="rounded-none text-xs h-9"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Cor da Etiqueta (Estilo Notion)</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(NOTION_KANBAN_COLORS) as NotionKanbanColor[]).map((cKey) => {
                    const opt = NOTION_KANBAN_COLORS[cKey];
                    const isSelected = createColor === cKey;
                    return (
                      <button
                        type="button"
                        key={cKey}
                        onClick={() => setCreateColor(cKey)}
                        className={`flex items-center gap-1.5 px-2 py-1.5 text-xs border rounded-none transition-all ${
                          isSelected
                            ? 'border-primary ring-1 ring-primary font-medium'
                            : 'border-border hover:bg-muted/40'
                        }`}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${opt.dot}`} />
                        <span className="text-[11px]">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="col-wip" className="text-xs">Limite WIP Opcional (Máximo de tarefas em simultâneo)</Label>
                <Input
                  id="col-wip"
                  type="number"
                  min="1"
                  placeholder="Sem limite (deixe em branco)"
                  value={createWip}
                  onChange={(e) => setCreateWip(e.target.value)}
                  className="rounded-none text-xs h-9"
                />
                <p className="text-[11px] text-muted-foreground">
                  Alerta a equipa no quadro quando a coluna ultrapassar o limite estipulado.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-none text-xs h-8"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCreating || !createName.trim()}
                className="rounded-none text-xs h-8"
              >
                {isCreating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                Criar Coluna
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Archive Column with Safe Migration */}
      <Dialog open={!!archiveTargetColumn} onOpenChange={(open) => !open && setArchiveTargetColumn(null)}>
        <DialogContent className="rounded-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Arquivar Coluna: {archiveTargetColumn?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              A coluna deixará de ser exibida no quadro, preservando todo o histórico de tarefas e relatórios.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            {archiveTargetColumn && archiveTargetColumn.taskCount && archiveTargetColumn.taskCount > 0 ? (
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200">
                  <p className="font-medium">
                    Esta coluna contém {archiveTargetColumn.taskCount} {archiveTargetColumn.taskCount === 1 ? 'tarefa' : 'tarefas'}.
                  </p>
                  <p className="text-[11px] mt-0.5">
                    Selecione a coluna ativa para onde deseja transferir estas tarefas antes de concluir o arquivamento.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Coluna de Destino</Label>
                  <select
                    value={selectedFallbackId}
                    onChange={(e) => setSelectedFallbackId(e.target.value)}
                    className="w-full h-9 border border-border bg-background px-3 text-xs rounded-none focus:outline-none focus:border-primary"
                  >
                    {columns
                      .filter((c) => c.id !== archiveTargetColumn.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({KANBAN_CATEGORIES_METADATA[c.category].label})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Esta coluna não contém nenhuma tarefa ativa e pode ser arquivada com segurança imediata.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setArchiveTargetColumn(null)}
              className="rounded-none text-xs h-8"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleArchiveConfirm}
              disabled={isArchiving || (archiveTargetColumn?.taskCount ? !selectedFallbackId : false)}
              className="rounded-none text-xs h-8"
            >
              {isArchiving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
              Confirmar Arquivamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Reset to Default Confirmation */}
      <Dialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
        <DialogContent className="rounded-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-primary" />
              Restaurar Fluxo Audiovisual Padrão
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Restaura as 4 colunas canónicas: &quot;A Fazer&quot;, &quot;Em Produção&quot;, &quot;Revisão Técnica&quot; e &quot;Concluído&quot;.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-xs text-muted-foreground space-y-2">
            <p>
              Quaisquer colunas personalizadas ativas serão arquivadas e as suas tarefas transferidas automaticamente para a coluna padrão correspondente.
            </p>
            <p className="font-medium text-foreground">
              Nenhuma tarefa será eliminada.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsResetConfirmOpen(false)}
              className="rounded-none text-xs h-8"
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                await resetToDefault();
                setIsResetConfirmOpen(false);
              }}
              disabled={isResetting}
              className="rounded-none text-xs h-8"
            >
              {isResetting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
              Confirmar Restauração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit & Customize Column Dialog */}
      <EditColumnDialog
        column={editTargetColumn}
        open={!!editTargetColumn}
        onOpenChange={(open) => !open && setEditTargetColumn(null)}
        onSave={async (colId, payload) => {
          await updateColumn({ columnId: colId, payload });
        }}
        onArchive={handleOpenArchive}
        canArchive={
          !editTargetColumn?.isDefault &&
          (editTargetColumn ? columnsByCategory[editTargetColumn.category].length > 1 : false)
        }
      />
    </div>
  );
}
