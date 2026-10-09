import api from './api';

export interface OrganizationData {
  id: string;
  name: string;
  legalName?: string | null;
  slug?: string | null;
  taxId?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const organizationsService = {
  getOrganization: async (organizationId: string): Promise<OrganizationData> => {
    const res = await api.get(`/organizations/${organizationId}`);
    return res.data?.data || res.data;
  },

  updateOrganization: async (
    organizationId: string,
    payload: { name?: string; legalName?: string; taxId?: string }
  ): Promise<OrganizationData> => {
    const res = await api.patch(`/organizations/${organizationId}`, payload);
    return res.data?.data || res.data;
  },
};
