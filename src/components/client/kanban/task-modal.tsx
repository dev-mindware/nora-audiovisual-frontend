'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ButtonSubmit,
  Input,
  GlobalModal,
  RHFSelect,
} from '@/components';
import { useCreateTask } from '@/hooks/projects';
import { useOrganizationKanbanSettings } from '@/hooks/use-organization-kanban-settings';
import { createTaskSchema, TaskFormData } from '@/schemas';
import { Kanban } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

const DEPARTMENTS = [
  { value: 'DIRECTION', label: 'Direcção' },
  { value: 'CAMERA', label: 'Câmara & Imagem' },
  { value: 'SOUND', label: 'Som Directo / Áudio' },
  { value: 'LIGHTING', label: 'Iluminação & Eléctrica' },
  { value: 'PRODUCTION', label: 'Produção & Logística' },
  { value: 'EDITING', label: 'Edição & Montagem' },
  { value: 'COLOR', label: 'Color Grading' },
  { value: 'ART', label: 'Arte & Cenografia' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' },
];

export function TaskModal({ isOpen, onClose, projectId }: TaskModalProps) {
  const { mutateAsync: createTask, isPending } = useCreateTask(projectId);
  const { columns } = useOrganizationKanbanSettings();

  const defaultColumn = columns.find((c) => c.isDefault) || columns[0];

  const columnOptions = useMemo(() => {
    if (columns && columns.length > 0) {
      return columns.map((col) => ({
        value: col.id,
        label: `${col.name}${col.isDefault ? ' (Padrão)' : ''}`,
      }));
    }
    return [
      { value: 'todo', label: 'A Fazer (Padrão)' },
      { value: 'in_progress', label: 'Em Curso' },
      { value: 'review', label: 'Revisão' },
      { value: 'done', label: 'Concluído' },
    ];
  }, [columns]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      department: 'CAMERA',
      priority: 'MEDIUM',
      columnId: defaultColumn?.id || '',
      dueAt: '',
    },
  });

  useEffect(() => {
    if (defaultColumn?.id && isOpen) {
      setValue('columnId', defaultColumn.id);
    }
  }, [defaultColumn?.id, isOpen, setValue]);

  const handleCancel = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: TaskFormData) => {
    try {
      const targetColumnId = data.columnId || defaultColumn?.id;
      const selectedCol = columns.find((c) => c.id === targetColumnId);

      await createTask({
        title: data.title,
        department: data.department,
        priority: data.priority,
        columnId: targetColumnId,
        status: selectedCol?.slug || 'TODO',
        dueAt: data.dueAt ? new Date(data.dueAt).toISOString() : undefined,
      });

      handleCancel();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={handleCancel}
      size="md"
      title="Nova Tarefa de Produção"
      description="Escale tarefas por departamento técnico, prioridade e coluna do fluxo da organização."
      icon={<Kanban className="h-5 w-5" />}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isPending}
            className="min-h-[44px] sm:min-h-0"
          >
            Cancelar
          </Button>
          <ButtonSubmit
            form="create-task-form"
            size="sm"
            isLoading={isPending}
            className="min-h-[44px] sm:min-h-0"
          >
            Adicionar Tarefa
          </ButtonSubmit>
        </>
      }
    >
      <form
        id="create-task-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 pt-2"
      >
        <Input
          label="Título da Tarefa *"
          placeholder="Ex: Alinhar lentes anamórficas / Gravação de foley"
          className="rounded-none"
          {...register('title')}
          error={errors.title?.message}
        />

        <div className="grid grid-cols-2 gap-3">
          <RHFSelect
            name="department"
            control={control}
            label="Departamento Técnico *"
            options={DEPARTMENTS}
          />

          <RHFSelect
            name="priority"
            control={control}
            label="Prioridade *"
            options={PRIORITIES}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <RHFSelect
            name="columnId"
            control={control}
            label="Coluna Inicial"
            options={columnOptions}
          />

          <Input
            type="date"
            label="Data Limite"
            startIcon="Calendar"
            className="rounded-none"
            {...register('dueAt')}
            error={errors.dueAt?.message}
          />
        </div>
      </form>
    </GlobalModal>
  );
}
