"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuthStore } from "@/stores";
import { api } from "@/services/api";
import { User } from "@/types";
import { clearLocalSession } from "@/actions/auth";

async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<User>("/auth/profile");
  return data;
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
    retry: false, // ✅ FIX: não retry para evitar múltiplos requests em loop
    staleTime: 5 * 60 * 1000,
  });

  // ✅ FIX: sempre fecha o loading, sucesso ou falha
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
      // Falha em buscar user → sessão inválida → limpa tudo
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

  // Listener para evento de sessão expirada (vindo do interceptor axios)
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
