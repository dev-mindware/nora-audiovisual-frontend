import { api } from './api';

export interface OrganizationMemberItem {
  id: string;
  organizationId: string;
  userId: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INVITED';
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  role?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface InviteMemberDto {
  email: string;
  roleId?: string;
}

export const membersService = {
  listMembers: async (organizationId: string): Promise<OrganizationMemberItem[]> => {
    const res = await api.get(`/organizations/${organizationId}/members`);
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : data.members || [];
  },

  inviteMember: async (organizationId: string, dto: InviteMemberDto) => {
    const res = await api.post(`/organizations/${organizationId}/members/invitations`, dto);
    return res.data?.data || res.data;
  },

  updateMemberRole: async (organizationId: string, memberId: string, roleId: string) => {
    const res = await api.patch(`/organizations/${organizationId}/members/${memberId}/role`, { roleId });
    return res.data?.data || res.data;
  },

  suspendMember: async (organizationId: string, memberId: string) => {
    const res = await api.post(`/organizations/${organizationId}/members/${memberId}/suspend`);
    return res.data;
  },

  reactivateMember: async (organizationId: string, memberId: string) => {
    const res = await api.post(`/organizations/${organizationId}/members/${memberId}/reactivate`);
    return res.data;
  },

  removeMember: async (organizationId: string, memberId: string) => {
    const res = await api.delete(`/organizations/${organizationId}/members/${memberId}`);
    return res.data;
  },
};
