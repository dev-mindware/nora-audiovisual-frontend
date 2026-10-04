"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { User, Role } from "@/types";
import { api } from "@/services/api";
import { createSession } from "@/lib/session";

import { registerActionSchema, type RegisterActionInput } from "@/schemas";

export { registerActionSchema, type RegisterActionInput };

export interface RegisterActionResult {
  user: User | null;
  activeOrganization?: any;
  memberships?: any[];
  redirectPath?: string;
  message?: string;
  error?: string;
}

export async function registerAction(
  data: RegisterActionInput
): Promise<RegisterActionResult> {
  try {
    const res = await api.post("/auth/register", data);

    const responseData = res.data?.data || res.data;
    const user = responseData.user;
    const activeOrganization = responseData.activeOrganization;
    const memberships = responseData.memberships || [];

    if (!user) {
      return {
        user: null,
        error: "Falha ao criar conta. Tente novamente.",
      };
    }

    // Encaminha os cookies de sessão Fastify para o cookieStore do Next.js
    const setCookieHeader = res.headers["set-cookie"];
    if (setCookieHeader) {
      const cookieStore = await cookies();
      const rawCookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
      for (const cookieStr of rawCookies) {
        const parts = cookieStr.split(";")[0].split("=");
        const name = parts[0]?.trim();
        const value = parts.slice(1).join("=").trim();
        if (name && value) {
          cookieStore.set(name, value, {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          });
        }
      }
    }

    const assignedRole: Role = "OWNER";
    user.role = assignedRole;

    await createSession({
      accessToken: "session_valid",
      refreshToken: "session_valid",
      role: assignedRole,
    });

    return {
      user,
      activeOrganization,
      memberships,
      redirectPath: "/dashboard",
      message: "Organização e conta criadas com sucesso!",
    };
  } catch (error: any) {
    const apiError = error.response?.data?.error || error.response?.data;
    const message = apiError?.message || error.message || "Erro ao registar organização.";
    return {
      user: null,
      error: message,
    };
  }
}
