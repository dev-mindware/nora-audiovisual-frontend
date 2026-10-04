import api from "./api";
import type { RoleDashboardData, DashboardFilterParams } from "@/types";

export const dashboardRoleService = {
  getRoleDashboard: async (params?: DashboardFilterParams): Promise<RoleDashboardData> => {
    const res = await api.get<RoleDashboardData>("/insights/dashboard", { params });
    return res.data;
  },
};
