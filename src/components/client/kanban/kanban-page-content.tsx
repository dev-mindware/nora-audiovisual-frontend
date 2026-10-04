'use client';

import { useState, useMemo } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import { useProjects, useProjectKanban, useMoveTask } from '@/hooks/projects';
import { useOrganizationKanbanSettings } from '@/hooks/use-organization-kanban-settings';
import { NOTION_KANBAN_COLORS } from '@/constants/kanban';
import { Button, Badge } from '@/components';
import { FilterPopover } from '@/components/shared';
import {
  ProjectTask,
  TaskDepartment,
  TaskPriority,
  OrganizationKanbanColumn,
} from '@/types';
import { TaskModal } from './task-modal';
import { EditColumnDialog } from './edit-column-dialog';
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  Clock,
  Clapperboard,
  AlertCircle,
  Settings2,
  Sliders,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

const DEPARTMENT_CONFIG: Record<TaskDepartment, { label: string; color: string }> = {
  DIRECTION: { label: 'Direção', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' },
  CAMERA: { label: 'Câmara', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30' },
  SOUND: { label: 'Som Direto', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  LIGHTING: { label: 'Iluminação', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30' },
  PRODUCTION: { label: 'Produção', color: 'bg-muted text-foreground border-border' },
  EDITING: { label: 'Edição', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  COLOR: { label: 'Color Grading', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' },
  ART: { label: 'Arte', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
};

const DEPARTMENT_OPTIONS = [
  { value: 'ALL', label: 'Todos os Departamentos' },
  { value: 'DIRECTION', label: 'Direção' },
  { value: 'CAMERA', label: 'Câmara' },
  { value: 'SOUND', label: 'Som Direto' },
  { value: 'LIGHTING', label: 'Iluminação' },
  { value: 'PRODUCTION', label: 'Produção' },
  { value: 'EDITING', label: 'Edição' },
  { value: 'COLOR', label: 'Color Grading' },
  { value: 'ART', label: 'Arte' },
];

const PRIORITY_OPTIONS = [
  { value: 'ALL', label: 'Todas as Prioridades' },
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' },
];

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; dotColor: string }> = {
  LOW: { label: 'Baixa', dotColor: 'bg-muted-foreground/40' },
  MEDIUM: { label: 'Média', dotColor: 'bg-sky-500' },
  HIGH: { label: 'Alta', dotColor: 'bg-amber-500' },
  URGENT: { label: 'Urgente', dotColor: 'bg-rose-500' },
};

const FALLBACK_COLUMNS: OrganizationKanbanColumn[] = [
  { id: 'TODO', name: 'A Fazer', slug: 'TODO', category: 'TODO', color: 'gray', position: 0, isDefault: true, createdAt: '', updatedAt: '' },
  { id: 'IN_PROGRESS', name: 'Em Produção', slug: 'IN_PROGRESS', category: 'IN_PROGRESS', color: 'blue', position: 1, isDefault: false, createdAt: '', updatedAt: '' },
  { id: 'REVIEW', name: 'Revisão Técnica', slug: 'REVIEW', category: 'IN_PROGRESS', color: 'purple', position: 2, isDefault: false, createdAt: '', updatedAt: '' },
  { id: 'DONE', name: 'Concluído', slug: 'DONE', category: 'DONE', color: 'green', position: 3, isDefault: false, createdAt: '', updatedAt: '' },
];

export function KanbanPageContent() {
  const [projectIdParam, setProjectIdParam] = useQueryState(
    'projectId',
    parseAsString.withDefault('').withOptions({ shallow: true })
  );
  const [department, setDepartment] = useQueryState(
    'department',
    parseAsString.withDefault('ALL').withOptions({ shallow: true })
  );
  const [priority, setPriority] = useQueryState(
    'priority',
    parseAsString.withDefault('ALL').withOptions({ shallow: true })
  );

  const { data: projectsData } = useProjects();
  const projects = projectsData?.data || [];

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editTargetColumn, setEditTargetColumn] = useState<OrganizationKanbanColumn | null>(null);

  // Active project ID
  const activeProjectId = projectIdParam || projects[0]?.id || '';

  const { data: kanbanData, isLoading: loadingKanban } = useProjectKanban(activeProjectId);
  const { columns: orgColumns, settings, updateColumn } = useOrganizationKanbanSettings();
  const { mutate: moveTask } = useMoveTask(activeProjectId);

  // Active columns sorted by position
  const activeColumns = useMemo(() => {
    const list = orgColumns && orgColumns.length > 0 ? orgColumns : FALLBACK_COLUMNS;
    return [...list].sort((a, b) => a.position - b.position);
  }, [orgColumns]);

  // Tasks grouped by column
  const tasksByColumn = useMemo(() => {
    let allTasks: ProjectTask[] = [];

    if (kanbanData?.tasks && Array.isArray(kanbanData.tasks)) {
      allTasks = kanbanData.tasks;
    } else if (kanbanData?.columns) {
      allTasks = Object.values(kanbanData.columns).flat();
    }

    // Apply department and priority filters
    const filteredTasks = allTasks.filter((t) => {
      if (department !== 'ALL' && t.department !== department) return false;
      if (priority !== 'ALL' && t.priority !== priority) return false;
      return true;
    });

    const map: Record<string, ProjectTask[]> = {};

    for (const col of activeColumns) {
      map[col.id] = [];
    }

    for (const task of filteredTasks) {
      // Find matching column by columnId or slug
      const matchedCol =
        activeColumns.find((c) => c.id === task.columnId) ||
        activeColumns.find((c) => c.slug === task.status) ||
        activeColumns.find((c) => c.isDefault) ||
        activeColumns[0];

      if (matchedCol) {
        if (!map[matchedCol.id]) map[matchedCol.id] = [];
        map[matchedCol.id].push(task);
      }
    }

    // Sort tasks in each column by fractional position or createdAt
    for (const colId of Object.keys(map)) {
      map[colId].sort((a, b) => {
        if (a.position && b.position && a.position !== b.position) {
          return String(a.position).localeCompare(String(b.position));
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    }

    return map;
  }, [kanbanData, activeColumns, department, priority]);

  // Optionally hide empty columns if requested in settings
  const visibleColumns = useMemo(() => {
    if (!settings?.hideEmptyColumns) return activeColumns;
    return activeColumns.filter((col) => (tasksByColumn[col.id]?.length || 0) > 0);
  }, [activeColumns, settings?.hideEmptyColumns, tasksByColumn]);

  const handleAdvance = (task: ProjectTask, currentColId: string) => {
    const currentIndex = activeColumns.findIndex((c) => c.id === currentColId);
    if (currentIndex >= 0 && currentIndex < activeColumns.length - 1) {
      const nextCol = activeColumns[currentIndex + 1];
      moveTask({
        taskId: task.id,
        columnId: nextCol.id,
        status: nextCol.slug,
        version: (task as any).version,
      });
    }
  };

  const handleRegress = (task: ProjectTask, currentColId: string) => {
    const currentIndex = activeColumns.findIndex((c) => c.id === currentColId);
    if (currentIndex > 0) {
      const prevCol = activeColumns[currentIndex - 1];
      moveTask({
        taskId: task.id,
        columnId: prevCol.id,
        status: prevCol.slug,
        version: (task as any).version,
      });
    }
  };

  // Card properties preferences
  const cardProps = settings?.cardProperties || {
    assignee: true,
    priority: true,
    department: true,
    dueDate: true,
    estimatedHours: false,
  };

  return (
    <div className="space-y-6">
      {/* Header com Seletor de Projeto e Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {projects.length > 0 && (
            <Select
              value={activeProjectId}
              onValueChange={(val) => setProjectIdParam(val)}
            >
              <SelectTrigger className="h-10 text-xs font-semibold rounded-none border-border bg-card px-3 gap-2 min-w-[200px]">
                <Clapperboard className="h-4 w-4 text-primary shrink-0" />
                <SelectValue placeholder="Selecione o projeto" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground rounded-none">
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <FilterPopover
            icon="Tag"
            label="Departamento"
            options={DEPARTMENT_OPTIONS}
            value={department}
            onChange={(val) => setDepartment(val || 'ALL')}
          />

          <FilterPopover
            icon="CircleDot"
            label="Prioridade"
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={(val) => setPriority(val || 'ALL')}
          />

          {(department !== 'ALL' || priority !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDepartment('ALL');
                setPriority('ALL');
              }}
              className="text-xs text-muted-foreground hover:text-foreground h-9 rounded-none border-border"
            >
              Limpar
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/settings?tab=kanban">
            <Button
              variant="outline"
              size="sm"
              className="rounded-none text-xs gap-1.5 h-9 border-border"
              title="Personalizar colunas e fluxo Kanban da organização"
            >
              <Settings2 className="h-3.5 w-3.5" />
              Definições do Fluxo
            </Button>
          </Link>

          <Button
            onClick={() => setIsTaskModalOpen(true)}
            disabled={!activeProjectId}
            className="rounded-none text-xs gap-1.5 h-9"
          >
            <Plus className="h-3.5 w-3.5" /> Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div
        className="grid gap-4 overflow-x-auto pb-4"
        style={{
          gridTemplateColumns: `repeat(${Math.max(visibleColumns.length, 1)}, minmax(280px, 1fr))`,
        }}
      >
        {visibleColumns.map((col, colIdx) => {
          const colTasks = tasksByColumn[col.id] || [];
          const colorStyle = NOTION_KANBAN_COLORS[col.color] || NOTION_KANBAN_COLORS.gray;
          const isOverWip = col.wipLimit ? colTasks.length > col.wipLimit : false;

          return (
            <div
              key={col.id}
              className={`flex flex-col rounded-none border bg-muted/20 p-3 shadow-none transition-colors ${
                isOverWip
                  ? 'border-amber-400 dark:border-amber-700 bg-amber-500/5'
                  : 'border-border'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 px-1 border-b border-border">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs border rounded-none font-medium ${colorStyle.bg} ${colorStyle.text} ${colorStyle.border}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${colorStyle.dot}`} />
                    {col.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {col.wipLimit ? (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 border rounded-none font-mono ${
                        isOverWip
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}
                      title={isOverWip ? 'Limite WIP ultrapassado' : 'Limite de tarefas simultâneas'}
                    >
                      {colTasks.length}/{col.wipLimit}
                    </span>
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-none bg-muted text-[11px] font-semibold text-foreground border border-border">
                      {colTasks.length}
                    </span>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditTargetColumn(col)}
                    className="h-5 w-5 text-muted-foreground hover:text-foreground rounded-none p-0"
                    title={`Personalizar coluna "${col.name}"`}
                  >
                    <Sliders className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Soft WIP Warning Alert */}
              {isOverWip && (
                <div className="flex items-center gap-1.5 px-2 py-1 mt-2 bg-amber-100/70 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-[10px] rounded-none">
                  <AlertCircle className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>Limite WIP excedido ({colTasks.length} de {col.wipLimit})</span>
                </div>
              )}

              {/* Column Tasks List */}
              <div className="flex flex-1 flex-col gap-2.5 pt-3 overflow-y-auto min-h-[400px]">
                {loadingKanban ? (
                  <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
                    A carregar tarefas...
                  </div>
                ) : colTasks.length === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center rounded-none border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    <span>Sem tarefas</span>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const dept = DEPARTMENT_CONFIG[task.department] || {
                      label: task.department,
                      color: 'bg-muted text-foreground border-border',
                    };
                    const priority = PRIORITY_CONFIG[task.priority] || {
                      label: task.priority,
                      dotColor: 'bg-muted-foreground',
                    };

                    const canRegress = colIdx > 0;
                    const canAdvance = colIdx < visibleColumns.length - 1;

                    return (
                      <div
                        key={task.id}
                        className="group flex flex-col gap-2 rounded-none border border-border bg-card p-3 shadow-none transition-all hover:border-primary/50"
                      >
                        {/* Tags Top: Department & Priority */}
                        {(cardProps.department || cardProps.priority) && (
                          <div className="flex items-center justify-between">
                            {cardProps.department && (
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-semibold py-0.5 px-2 rounded-none ${dept.color}`}
                              >
                                {dept.label}
                              </Badge>
                            )}

                            {cardProps.priority && (
                              <div className="flex items-center gap-1.5" title={`Prioridade: ${priority.label}`}>
                                <span className={`h-2 w-2 rounded-full ${priority.dotColor}`} />
                                <span className="text-[10px] font-medium text-muted-foreground">
                                  {priority.label}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <h4 className="text-xs font-semibold text-foreground leading-snug">
                          {task.title}
                        </h4>

                        {/* Due date if enabled */}
                        {cardProps.dueDate && task.dueAt && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{new Date(task.dueAt).toLocaleDateString('pt-PT')}</span>
                          </div>
                        )}

                        {/* Card Bottom: Navigation & Assignee */}
                        <div className="flex items-center justify-between border-t border-border pt-2 mt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={!canRegress}
                            onClick={() => handleRegress(task, col.id)}
                            className="h-6 w-6 p-0 rounded-none text-muted-foreground hover:text-foreground disabled:opacity-20"
                            title="Mover para coluna anterior"
                          >
                            <ArrowLeft className="h-3 w-3" />
                          </Button>

                          {cardProps.assignee && (
                            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                              {task.assigneeName || 'Geral'}
                            </span>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={!canAdvance}
                            onClick={() => handleAdvance(task, col.id)}
                            className="h-6 w-6 p-0 rounded-none text-primary hover:bg-primary/10 disabled:opacity-20"
                            title="Avançar para próxima coluna"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activeProjectId && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          projectId={activeProjectId}
        />
      )}

      {/* Edit & Customize Column Dialog */}
      <EditColumnDialog
        column={editTargetColumn}
        open={!!editTargetColumn}
        onOpenChange={(open) => !open && setEditTargetColumn(null)}
        onSave={async (colId, payload) => {
          await updateColumn({ columnId: colId, payload });
        }}
      />
    </div>
  );
}
