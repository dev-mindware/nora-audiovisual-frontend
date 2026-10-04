import { User } from "@/types";
import api from "./api";

export const authService = {
  getMe: async (): Promise<User | null> => {
    try {
      const response = await api.get("/auth/me");
      const data = response.data?.data || response.data;
      return data?.user || data;
    } catch {
      try {
        const response = await api.get<User>("/auth/profile");
        return response.data;
      } catch (error) {
        console.error("Erro ao obter o utilizador actual:", error);
        return null;
      }
    }
  },

  switchOrganization: async (organizationId: string) => {
    const res = await api.post("/auth/organization/switch", { organizationId });
    return res.data?.data || res.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      "/auth/forgot-password",
      { email },
    );
    return response.data;
  },

  resetPassword: async (data: {
    token: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      "/auth/reset-password",
      data,
    );
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>(
      "/auth/change-password",
      data,
    );
    return response.data;
  },
};
