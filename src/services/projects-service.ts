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
  serviceId?: string;
  title: string;
  description?: string;
  lifecycleStatus?: string;
  productionStage?: string;
  startDate?: string;
  endDate?: string;
  responsibleUserId?: string;
}

// ---------------------------------------------------------------------------
// Adaptador entre o modelo de Call Sheet da API (shootingDate, callTime, crew[]) e o da interface.
// ---------------------------------------------------------------------------
interface ApiCallSheet {
  id: string;
  projectId: string;
  shootingDate: string;
  callTime: string;
  location: string;
  generalNotes?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  project?: { title?: string } | null;
  crew?: Array<{
    id: string;
    roleName: string;
    callTime: string;
    contactPhone?: string | null;
    notes?: string | null;
  }>;
}

function fromApiCallSheet(raw: ApiCallSheet): CallSheet {
  const firstLine = raw.generalNotes?.split('\n')[0]?.trim();
  return {
    id: raw.id,
    projectId: raw.projectId,
    projectTitle: raw.project?.title,
    title: firstLine || `Rodagem de ${String(raw.shootingDate).slice(0, 10)}`,
    shootDate: raw.shootingDate,
    generalCallTime: raw.callTime,
    location: raw.location,
    weatherForecast: null,
    nearestHospital: null,
    status: raw.status === 'PUBLISHED' ? 'PUBLISHED' : raw.status === 'DRAFT' ? 'DRAFT' : 'ARCHIVED',
    crewMembers: (raw.crew ?? []).map((c) => ({
      id: c.id,
      name: c.roleName,
      role: c.roleName,
      callTime: c.callTime,
      phone: c.contactPhone ?? undefined,
      notes: c.notes ?? undefined,
    })),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function toApiCallSheet(
  projectId: string,
  data: {
    title: string;
    shootDate: string;
    generalCallTime: string;
    location: string;
    weatherForecast?: string;
    nearestHospital?: string;
    crewMembers?: Array<{ name: string; role: string; callTime: string; phone?: string }>;
  },
) {
  const notes = [
    data.title,
    data.weatherForecast ? `Meteorologia: ${data.weatherForecast}` : '',
    data.nearestHospital ? `Hospital mais próximo: ${data.nearestHospital}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    projectId,
    shootingDate: String(data.shootDate).slice(0, 10),
    callTime: data.generalCallTime,
    location: data.location,
    generalNotes: notes,
    crew: (data.crewMembers ?? []).map((m) => ({
      roleName: m.role || m.name,
      callTime: m.callTime || data.generalCallTime,
      contactPhone: m.phone,
      notes: m.name && m.name !== m.role ? m.name : undefined,
    })),
  };
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
    return Array.isArray(data) ? (data as ApiCallSheet[]).map(fromApiCallSheet) : [];
  },

  getCallSheet: async (callSheetId: string): Promise<CallSheet> => {
    const res = await api.get(`/call-sheets/${callSheetId}`);
    return fromApiCallSheet(res.data?.data || res.data);
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
    const res = await api.post('/call-sheets', toApiCallSheet(projectId, data));
    return fromApiCallSheet(res.data?.data || res.data);
  },

  /** Rascunho gerado a partir da equipa e do equipamento reservados no projecto (o produtor só revê e publica). */
  generateCallSheetDraft: async (projectId: string, shootingDate?: string): Promise<CallSheet> => {
    const res = await api.post(`/projects/${projectId}/call-sheets/draft`, shootingDate ? { shootingDate } : {});
    return fromApiCallSheet(res.data?.data || res.data);
  },

  publishCallSheet: async (
    callSheetId: string,
    data?: { notifyCrew?: boolean; customMessage?: string }
  ): Promise<CallSheet> => {
    const res = await api.post(`/call-sheets/${callSheetId}/publish`, { notifyCrew: data?.notifyCrew ?? true });
    return fromApiCallSheet(res.data?.data || res.data);
  },
};
