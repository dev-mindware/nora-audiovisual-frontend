import { api } from './api';
import {
  OrganizationKanbanData,
  OrganizationKanbanColumn,
  OrganizationKanbanSettings,
  KanbanCategory,
  NotionKanbanColor,
  CardProperties,
} from '@/types';

export interface CreateKanbanColumnPayload {
  name: string;
  category: KanbanCategory;
  color?: NotionKanbanColor;
  wipLimit?: number | null;
  isDefault?: boolean;
}

export interface UpdateKanbanColumnPayload {
  name?: string;
  color?: NotionKanbanColor;
  category?: KanbanCategory;
  wipLimit?: number | null;
  isDefault?: boolean;
}

export interface UpdateCardPropertiesPayload {
  version: number;
  cardProperties?: Partial<CardProperties>;
  hideEmptyColumns?: boolean;
}

export const kanbanSettingsService = {
  getSettings: async (organizationId: string): Promise<OrganizationKanbanData> => {
    const res = await api.get(`/organizations/${organizationId}/kanban-settings`);
    return res.data?.data || res.data;
  },

  createColumn: async (
    organizationId: string,
    payload: CreateKanbanColumnPayload
  ): Promise<OrganizationKanbanColumn> => {
    const res = await api.post(`/organizations/${organizationId}/kanban-settings/columns`, payload);
    return res.data?.data || res.data;
  },

  updateColumn: async (
    organizationId: string,
    columnId: string,
    payload: UpdateKanbanColumnPayload
  ): Promise<OrganizationKanbanColumn> => {
    const res = await api.patch(
      `/organizations/${organizationId}/kanban-settings/columns/${columnId}`,
      payload
    );
    return res.data?.data || res.data;
  },

  reorderColumns: async (
    organizationId: string,
    columnIds: string[]
  ): Promise<{ success: boolean }> => {
    const res = await api.put(`/organizations/${organizationId}/kanban-settings/columns/reorder`, {
      columnIds,
    });
    return res.data?.data || res.data;
  },

  archiveColumn: async (
    organizationId: string,
    columnId: string,
    targetColumnId?: string
  ): Promise<{ success: boolean; archivedColumnId: string; tasksMigrated: number }> => {
    const res = await api.post(
      `/organizations/${organizationId}/kanban-settings/columns/${columnId}/archive`,
      { targetColumnId }
    );
    return res.data?.data || res.data;
  },

  updateCardProperties: async (
    organizationId: string,
    payload: UpdateCardPropertiesPayload
  ): Promise<OrganizationKanbanSettings> => {
    const res = await api.patch(
      `/organizations/${organizationId}/kanban-settings/card-properties`,
      payload
    );
    return res.data?.data || res.data;
  },

  resetToDefault: async (organizationId: string): Promise<OrganizationKanbanData> => {
    const res = await api.post(`/organizations/${organizationId}/kanban-settings/reset`);
    return res.data?.data || res.data;
  },
};
