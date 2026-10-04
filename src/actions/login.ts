"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { User, Role } from "@/types";
import { loginSchema } from "@/schemas";
import { api } from "@/services/api";
import { createSession, destroySession } from "@/lib/session";
import { resetAccessTokenCache } from "@/services/api";
import { ROLE_REDIRECTS } from "@/constants/routes";

interface LoginActionResult {
  user: User | null;
  activeOrganization?: any;
  memberships?: any[];
  redirectPath?: string;
  message?: string;
  token?: string;
}

export async function loginAction({
  email,
  password,
}: z.infer<typeof loginSchema>): Promise<LoginActionResult> {
  try {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    const responseData = res.data?.data || res.data;
    const user = responseData.user;
    const activeOrganization = responseData.activeOrganization;
    const memberships = responseData.organizations || responseData.memberships || [];

    if (!user) {
      throw new Error("Credenciais de acesso inválidas.");
    }

    // Encaminha os cookies de sessão Fastify (nora_session) para os cookies do Next.js
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

    const isPlatformAdmin = Boolean(user.isPlatformAdmin || responseData.isPlatformAdmin);
    const roleFromResponse = responseData.role?.code || user.role;
    const assignedRole: Role = (
      isPlatformAdmin || roleFromResponse === "ADMIN"
        ? "ADMIN"
        : (roleFromResponse as Role) || "OWNER"
    );

    user.role = assignedRole;
    user.isPlatformAdmin = isPlatformAdmin;
    user.activeOrganization = activeOrganization;
    user.memberships = memberships;

    // Persiste payload de sessão para controlo de acesso client-side
    await createSession({
      accessToken: "session_valid",
      refreshToken: "session_valid",
      role: assignedRole,
    });

    const targetRedirect = assignedRole === "ADMIN" ? "/admin" : (ROLE_REDIRECTS[assignedRole] || "/dashboard");

    return {
      user,
      activeOrganization,
      memberships,
      message: "Autenticado com sucesso",
      redirectPath: targetRedirect,
      token: "session_valid",
    };
  } catch (error: any) {
    let messageError = "Credenciais inválidas ou erro ao contactar a API.";

    if (error?.response?.data?.message) {
      messageError = error.response.data.message;
    } else if (error instanceof Error) {
      messageError = error.message;
    }

    return {
      user: null,
      redirectPath: "/auth/login",
      message: messageError,
    };
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("nora_session")?.value;
    if (sessionCookie) {
      await api.post("/auth/logout", {}, {
        headers: { Cookie: `nora_session=${sessionCookie}` },
      });
    }
  } catch (error) {
    // Sessão destruída localmente
  } finally {
    const cookieStore = await cookies();
    cookieStore.delete("nora_session");
    cookieStore.delete("__Host-nora_session");
    await destroySession();
    resetAccessTokenCache();
  }
}
