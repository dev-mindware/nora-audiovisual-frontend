"use server";

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

/**
 * Sincroniza a sessão do utilizador com os cookies de servidor do Next.js
 */
export async function syncSessionAction(
  token: string,
  role: Role = "OWNER"
): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    cookieStore.set("nora_token", token, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
    });

    await createSession({
      accessToken: token,
      refreshToken: token,
      role,
    });
    return true;
  } catch (err) {
    console.warn("syncSessionAction: aviso ao gravar cookies de sessão:", err);
    return false;
  }
}

export async function registerAction(
  data: RegisterActionInput
): Promise<RegisterActionResult> {
  try {
    // Sanitiza payload: remove campos vazios para não violar schemas estritos no backend
    const cleanPayload: Record<string, any> = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      organizationName: data.organizationName.trim(),
      planCode: data.planCode || "INICIAL",
    };

    if (data.organizationSlug?.trim()) {
      cleanPayload.organizationSlug = data.organizationSlug.trim();
    }
    if (data.taxId?.trim()) {
      cleanPayload.taxId = data.taxId.trim();
    }

    const res = await api.post("/auth/register", cleanPayload);

    const responseData = res.data?.data || res.data;
    const rawUser = responseData?.user;
    const rawOrg = responseData?.activeOrganization;
    const rawMemberships = responseData?.memberships || responseData?.organizations || [];

    if (!rawUser) {
      return {
        user: null,
        error: "Falha ao criar conta. Tente novamente.",
      };
    }

    // Extrai o token de sessão retornado pela API ou dos headers Set-Cookie
    let sessionToken = responseData.token || responseData.accessToken;
    const setCookieHeader = res.headers?.["set-cookie"];
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

    const assignedRole: Role = "OWNER";

    // Persiste os cookies de sessão de forma segura
    await syncSessionAction(sessionToken, assignedRole);

    // Retorna POJOs 100% serializáveis para garantir que o RSC Flight Protocol não quebre
    const serializedUser: User = {
      id: String(rawUser.id),
      email: String(rawUser.email),
      name: String(rawUser.name),
      role: assignedRole,
      status: rawUser.status || "ACTIVE",
    };

    const serializedOrg = rawOrg
      ? {
          id: String(rawOrg.id),
          name: String(rawOrg.name),
          slug: String(rawOrg.slug || ""),
        }
      : undefined;

    const serializedMemberships = Array.isArray(rawMemberships)
      ? rawMemberships.map((m: any) => ({
          organizationId: String(m.organizationId || m.id),
          organizationName: String(m.organizationName || m.name || "Organização"),
          roleId: String(m.roleId || m.role || "OWNER"),
        }))
      : [];

    return {
      user: serializedUser,
      activeOrganization: serializedOrg,
      memberships: serializedMemberships,
      redirectPath: "/dashboard",
      token: sessionToken,
      message: "Organização e conta criadas com sucesso!",
    };
  } catch (error: any) {
    const apiError = error.response?.data?.error || error.response?.data;
    const message =
      apiError?.message ||
      error.response?.data?.message ||
      error.message ||
      "Erro ao registar organização.";

    return {
      user: null,
      error: typeof message === "string" ? message : "Erro ao registar organização.",
    };
  }
}
