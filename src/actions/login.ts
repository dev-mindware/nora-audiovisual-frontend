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
  mfaRequired?: boolean;
}

export async function loginAction({
  email,
  password,
  mfaCode,
}: z.infer<typeof loginSchema>): Promise<LoginActionResult> {
  try {
    const res = await api.post("/auth/login", {
      email,
      password,
      ...(mfaCode ? { mfaCode } : {}),
    });

    const responseData = res.data?.data || res.data;
    const user = responseData.user;
    const activeOrganization = responseData.activeOrganization;
    const memberships = responseData.organizations || responseData.memberships || [];

    if (!user) {
      throw new Error("Credenciais de acesso inválidas.");
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

    // Persiste payload de sessão com o token real
    await createSession({
      accessToken: sessionToken,
      refreshToken: sessionToken,
      role: assignedRole,
    });

    const targetRedirect = assignedRole === "ADMIN" ? "/admin" : (ROLE_REDIRECTS[assignedRole] || "/dashboard");

    return {
      user,
      activeOrganization,
      memberships,
      message: "Autenticado com sucesso",
      redirectPath: targetRedirect,
      token: sessionToken,
    };
  } catch (error: any) {
    let messageError = "Credenciais inválidas ou erro ao contactar a API.";

    // Segundo factor: a API responde MFA_REQUIRED quando a palavra-passe está certa mas falta o código
    if (error?.response?.data?.code === "MFA_REQUIRED") {
      return {
        user: null,
        mfaRequired: true,
        redirectPath: "/auth/login",
        message: "Introduza o código de verificação da sua aplicação autenticadora.",
      };
    }

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
