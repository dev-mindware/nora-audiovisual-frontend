import type { User } from "@/types";
import { api } from "./api";

export interface UpdateUserProfilePayload {
  name: string;
}

export const userService = {
  /** O próprio utilizador actualiza o seu perfil (a API só permite o nome). */
  updateProfile: async (data: UpdateUserProfilePayload) => {
    return api.patch<{ data: Pick<User, "id" | "name" | "email"> }>("/auth/me", data);
  },
  getUserById: async (id: string) => {
    return api.get<User>(`/users/${id}`);
  },
  getUsers: async (params?: Record<string, any>) => {
    return api.get<any>(`/users`, { params });
  },
};
