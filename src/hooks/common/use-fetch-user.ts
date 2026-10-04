"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuthStore } from "@/stores";
import { useTenantStore } from "@/stores/tenant";
import { api } from "@/services/api";
import { User, Role } from "@/types";
import { clearLocalSession } from "@/actions/auth";

async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<{ data: any }>("/auth/me");
  const payload = data.data || data;
  const user = payload.user || payload;
  const activeOrg = payload.activeOrganization; // null para admins

  const isPlatformAdmin = Boolean(
    user?.isPlatformAdmin ||
    payload.user?.isPlatformAdmin
  );

  // Suporta ambos os formatos: role (objecto) e roles[] (array) — doc usa roles[]
  const roleObj = payload.role || payload.roles?.[0] || null;
  const roleCode: Role = (
    isPlatformAdmin || roleObj?.code === "ADMIN"
      ? "ADMIN"
      : (roleObj?.code as Role) || (user?.role as Role) || "OWNER"
  );

  const memberships = payload.memberships || [];

  const combinedUser: User = {
    ...user,
    isPlatformAdmin,
    role: roleCode,
    activeOrganization: activeOrg,
    memberships,
    company: activeOrg ? { name: activeOrg.name, id: activeOrg.id } : undefined,
  };

  // Sincroniza store de multi-tenancy.
  // Admins de plataforma não têm organização activa — limpar o store para evitar
  // que o sidebar exiba menus de org para o admin.
  if (isPlatformAdmin) {
    useTenantStore.getState().setActiveOrganization(null);
  } else if (activeOrg) {
    useTenantStore.getState().setActiveOrganization({
      id: activeOrg.id,
      name: activeOrg.name,
      slug: activeOrg.slug,
      role: roleCode,
    });
  }

  if (memberships.length > 0) {
    useTenantStore.getState().setOrganizations(
      memberships.map((m: any) => ({
        id: m.organizationId,
        name: m.organizationName || "Nora Studio",
        role: m.roleId,
      }))
    );
  }

  return combinedUser;
}

interface UseFetchUserOptions {
  enabled?: boolean;
}

export function useFetchUser({ enabled = true }: UseFetchUserOptions = {}) {
  const { setUser, setIsAuthenticating } = useAuthStore();

  const query = useQuery({
    queryKey: ["user"],
    queryFn: fetchCurrentUser,
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!enabled) {
      setIsAuthenticating(false);
      return;
    }

    if (query.isSuccess && query.data) {
      setUser(query.data);
      setIsAuthenticating(false);
    }

    if (query.isError) {
      (async () => {
        await clearLocalSession();
        setUser(null);
        setIsAuthenticating(false);
      })();
    }
  }, [
    enabled,
    query.isSuccess,
    query.isError,
    query.data,
    setUser,
    setIsAuthenticating,
  ]);

  useEffect(() => {
    function handleSessionExpired() {
      setUser(null);
      setIsAuthenticating(false);
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/auth/login"
      ) {
        window.location.replace("/auth/login");
      }
    }

    window.addEventListener("session:expired", handleSessionExpired);
    return () =>
      window.removeEventListener("session:expired", handleSessionExpired);
  }, [setUser, setIsAuthenticating]);

  return query;
}
