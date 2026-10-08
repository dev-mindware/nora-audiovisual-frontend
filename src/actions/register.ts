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
  token?: string;
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

    // Extrai o token de sessão retornado pela API ou dos headers Set-Cookie
    let sessionToken = responseData.token || responseData.accessToken;
    const setCookieHeader = res.headers["set-cookie"];
    if (!sessionToken && setCookieHeader) {
      const rawCookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
      for (const cookieStr of rawCookies) {
        const parts = cookieStr.split(";")[0].split("=");
        const name = parts[0]?.trim();
        const value = parts.slice(1).join("=").trim();
        if (name === "__Host-nora_session" || name === "nora_session") {
          sessionToken = value;
          break;
        }
      }
    }
    sessionToken = sessionToken || "session_valid";

    // Limpa quaisquer cookies residuais duplicados do Fastify no domínio do Next.js
    const cookieStore = await cookies();
    cookieStore.delete("__Host-nora_session");
    cookieStore.delete("nora_session");

    // Define cookie público acessível ao axios no browser
    cookieStore.set("nora_token", sessionToken, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
    });

    const assignedRole: Role = "OWNER";
    user.role = assignedRole;

    await createSession({
      accessToken: sessionToken,
      refreshToken: sessionToken,
      role: assignedRole,
    });

    return {
      user,
      activeOrganization,
      memberships,
      redirectPath: "/dashboard",
      token: sessionToken,
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
