import { User } from "@/types";
import api from "./api";

export const authService = {
  getMe: async (): Promise<User | null> => {
    try {
      const response = await api.get("/auth/me");
      const data = response.data?.data || response.data;
      return data?.user || data;
    } catch (error) {
      console.error("Erro ao obter o utilizador actual:", error);
      return null;
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

  /** Devolve 204; as restantes sessões do utilizador são revogadas pela API. */
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await api.post("/auth/change-password", data);
  },

  getMfaStatus: async (): Promise<{ enabled: boolean }> => {
    const response = await api.get("/auth/mfa/status");
    return response.data?.data ?? response.data;
  },

  setupMfa: async (): Promise<{ secret: string; otpauthUri: string }> => {
    const response = await api.post("/auth/mfa/setup", {});
    return response.data?.data ?? response.data;
  },

  /** Confirma o primeiro código; devolve os recovery codes (mostrados uma única vez). */
  enableMfa: async (code: string): Promise<{ recoveryCodes: string[] }> => {
    const response = await api.post("/auth/mfa/enable", { code });
    return response.data?.data ?? response.data;
  },

  disableMfa: async (data: { password: string; code: string }): Promise<void> => {
    await api.post("/auth/mfa/disable", data);
  },
};
