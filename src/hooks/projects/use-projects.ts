import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService, ProjectFilters, CreateProjectPayload } from '@/services/projects-service';
import { SucessMessage, ErrorMessage } from '@/utils/messages';
import { getApiErrorMessage } from '@/utils';

export const PROJECTS_QUERY_KEY = ['projects'];

export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, filters],
    queryFn: () => projectsService.getAll(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useProject(id?: string) {
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, 'detail', id],
    queryFn: () => projectsService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useProjectKanban(projectId?: string) {
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, 'kanban', projectId],
    queryFn: () => projectsService.getKanbanBoard(projectId!),
    enabled: Boolean(projectId),
  });
}

export function useProjectMembers(projectId?: string) {
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, 'members', projectId],
    queryFn: () => projectsService.listMembers(projectId!),
    enabled: Boolean(projectId),
  });
}

export function useProjectCallSheets(projectId?: string) {
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, 'call-sheets', projectId],
    queryFn: () => projectsService.listCallSheets(projectId!),
    enabled: Boolean(projectId),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectPayload) => projectsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      SucessMessage('Projecto criado com sucesso!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Falha ao criar projecto.'));
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProjectPayload> }) =>
      projectsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_QUERY_KEY, 'detail', variables.id] });
      SucessMessage('Projecto actualizado com sucesso!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Falha ao actualizar projecto.'));
    },
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      department: string;
      priority?: string;
      status?: string;
      columnId?: string;
      dueAt?: string;
      assigneeId?: string;
    }) => projectsService.createTask(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_QUERY_KEY, 'kanban', projectId] });
      SucessMessage('Tarefa criada com sucesso!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Falha ao criar tarefa.'));
    },
  });
}

export function useMoveTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      taskId: string;
      columnId?: string;
      status?: string;
      beforeTaskId?: string;
      afterTaskId?: string;
      position?: number | string;
      version?: number;
    }) =>
      projectsService.moveTask(projectId, data.taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_QUERY_KEY, 'kanban', projectId] });
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Falha ao mover tarefa.'));
    },
  });
}

export function useAddProjectMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; projectRole: string }) =>
      projectsService.addMember(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_QUERY_KEY, 'members', projectId] });
      SucessMessage('Membro adicionado à equipa com sucesso!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Falha ao adicionar membro à equipa.'));
    },
  });
}

export function useRemoveProjectMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => projectsService.removeMember(projectId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_QUERY_KEY, 'members', projectId] });
      SucessMessage('Membro removido da equipa.');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Falha ao remover membro da equipa.'));
    },
  });
}

export function useCreateCallSheet(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      shootDate: string;
      generalCallTime: string;
      location: string;
      weatherForecast?: string;
      nearestHospital?: string;
      crewMembers?: Array<{ name: string; role: string; callTime: string; phone?: string }>;
    }) => projectsService.createCallSheet(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_QUERY_KEY, 'call-sheets', projectId] });
      SucessMessage('Folha de Rodagem (Call Sheet) criada com sucesso!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Falha ao criar Call Sheet.'));
    },
  });
}

export function usePublishCallSheet(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ callSheetId, data }: { callSheetId: string; data?: { notifyCrew?: boolean; customMessage?: string } }) =>
      projectsService.publishCallSheet(callSheetId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_QUERY_KEY, 'call-sheets', projectId] });
      SucessMessage('Folha de Rodagem publicada e despachada para a equipa!');
    },
    onError: (err) => {
      ErrorMessage(getApiErrorMessage(err, 'Falha ao publicar Call Sheet.'));
    },
  });
}

