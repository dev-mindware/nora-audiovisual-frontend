import { api } from './api';
import {
  Project,
  ProjectTask,
  ProjectMember,
  CallSheet,
  CreateTaskDto,
  MoveTaskDto,
} from '@/types';

export interface ProjectFilters {
  search?: string;
  status?: string;
  stage?: string;
  clientId?: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProjectPayload {
  clientId: string;
  title: string;
  description?: string;
  lifecycleStatus?: string;
  productionStage?: string;
  startDate?: string;
  endDate?: string;
  responsibleUserId?: string;
}

export const projectsService = {
  getAll: async (filters: ProjectFilters = {}): Promise<{ data: Project[]; total?: number; meta?: any }> => {
    const res = await api.get('/projects', { params: filters });
    const payload = res.data?.data || res.data;
    if (Array.isArray(payload)) {
      return { data: payload, total: payload.length };
    }
    return {
      data: payload.items || payload.data || [],
      total: payload.meta?.total ?? payload.total ?? (payload.items?.length || 0),
      meta: payload.meta,
    };
  },

  getById: async (id: string): Promise<Project> => {
    const res = await api.get(`/projects/${id}`);
    return res.data?.data || res.data;
  },

  create: async (data: CreateProjectPayload): Promise<Project> => {
    const res = await api.post('/projects', data);
    return res.data?.data || res.data;
  },

  update: async (id: string, data: Partial<CreateProjectPayload>): Promise<Project> => {
    const res = await api.patch(`/projects/${id}`, data);
    return res.data?.data || res.data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },

  getKanbanBoard: async (
    projectId: string
  ): Promise<{
    columns: Record<string, ProjectTask[]>;
    tasks: ProjectTask[];
  }> => {
    const res = await api.get(`/projects/${projectId}/kanban`);
    return res.data?.data || res.data;
  },

  createTask: async (
    projectId: string,
    data: {
      title: string;
      department: string;
      priority?: string;
      status?: string;
      columnId?: string;
      dueAt?: string;
      assigneeId?: string;
    }
  ): Promise<ProjectTask> => {
    const res = await api.post(`/projects/${projectId}/tasks`, data);
    return res.data?.data || res.data;
  },

  moveTask: async (
    projectId: string,
    taskId: string,
    data: {
      columnId?: string;
      status?: string;
      beforeTaskId?: string;
      afterTaskId?: string;
      position?: number | string;
      version?: number;
    }
  ): Promise<ProjectTask> => {
    const res = await api.post(`/projects/${projectId}/tasks/${taskId}/move`, data);
    return res.data?.data || res.data;
  },

  listMembers: async (projectId: string): Promise<ProjectMember[]> => {
    const res = await api.get(`/projects/${projectId}/members`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  addMember: async (
    projectId: string,
    data: { userId: string; projectRole: string }
  ): Promise<ProjectMember> => {
    const res = await api.post(`/projects/${projectId}/members`, data);
    return res.data?.data || res.data;
  },

  removeMember: async (projectId: string, memberId: string): Promise<{ success: boolean }> => {
    const res = await api.delete(`/projects/${projectId}/members/${memberId}`);
    return res.data;
  },

  listCallSheets: async (projectId: string): Promise<CallSheet[]> => {
    const res = await api.get(`/projects/${projectId}/call-sheets`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : [];
  },

  getCallSheet: async (callSheetId: string): Promise<CallSheet> => {
    const res = await api.get(`/call-sheets/${callSheetId}`);
    return res.data?.data || res.data;
  },

  createCallSheet: async (
    projectId: string,
    data: {
      title: string;
      shootDate: string;
      generalCallTime: string;
      location: string;
      weatherForecast?: string;
      nearestHospital?: string;
      crewMembers?: Array<{ name: string; role: string; callTime: string; phone?: string }>;
    }
  ): Promise<CallSheet> => {
    const res = await api.post('/call-sheets', {
      projectId,
      ...data,
    });
    return res.data?.data || res.data;
  },

  publishCallSheet: async (
    callSheetId: string,
    data?: { notifyCrew?: boolean; customMessage?: string }
  ): Promise<CallSheet> => {
    const res = await api.post(`/call-sheets/${callSheetId}/publish`, data || {});
    return res.data?.data || res.data;
  },
};
