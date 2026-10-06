"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ErrorMessage, InfoMessage } from "@/utils/messages";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, loginSchema } from "@/schemas";
import { useState } from "react";
import { ButtonSubmit, Input } from "@/components/ui";
import { loginAction } from "@/actions/login";
import { useAuthStore } from "@/stores";
import { useTenantStore } from "@/stores/tenant";
import { queryClient } from "@/lib";
import { getApiErrorMessage } from "@/utils";
import { Clapperboard, ArrowRight, ShieldCheck } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const { setUser, setIsAuthenticating } = useAuthStore();
  const { setActiveOrganization, setOrganizations, clearTenant } = useTenantStore();
  const [mfaRequired, setMfaRequired] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  async function handleLogin({ email, password, mfaCode }: LoginFormData) {
    try {
      const res = await loginAction({ email, password, mfaCode });

      if (res.mfaRequired) {
        setMfaRequired(true);
        InfoMessage(res.message || "Introduza o código MFA.");
        return;
      }

      if (!res.user) {
        ErrorMessage(res.message || "Erro ao tentar fazer login.");
        return;
      }

      setIsAuthenticating(true);

      const isAdmin = res.user.isPlatformAdmin || res.user.role === "ADMIN";

      if (isAdmin) {
        clearTenant();
      } else {
        if (res.activeOrganization) {
          setActiveOrganization({
            id: res.activeOrganization.id,
            name: res.activeOrganization.name,
            slug: res.activeOrganization.slug,
          });
        }

        if (res.memberships && res.memberships.length > 0) {
          setOrganizations(
            res.memberships.map((m: any) => ({
              id: m.organizationId,
              name: m.organizationName || "Organização",
              role: m.roleId,
            }))
          );
        }
      }

      queryClient.setQueryData(["user"], res.user);
      setUser(res.user);
      router.replace(res.redirectPath || "/dashboard");
    } catch (error) {
      setIsAuthenticating(false);
      ErrorMessage(getApiErrorMessage(error, "Ocorreu um erro inesperado. Tente novamente."));
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto my-auto flex flex-col gap-6">
      {/* Header com badge de produção audiovisual */}
      <div className="flex flex-col gap-2.5 text-left">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Iniciar Sessão
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Introduza as suas credenciais para aceder aos seus projetos, folhas de chamada e equipamentos.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleLogin)} className="flex flex-col gap-5">
        <div className="grid gap-4">
          <Input
            type="email"
            label="Email Profissional"
            startIcon="AtSign"
            placeholder="admin@nora-audiovisual.com"
            {...register("email")}
            error={errors?.email && errors?.email?.message}
            autoComplete="email"
          />

          <div className="flex flex-col space-y-1.5">
            <Input
              label="Palavra-passe"
              startIcon="Lock"
              type="password"
              placeholder="••••••••••••"
              {...register("password")}
              error={errors?.password && errors?.password?.message}
              autoComplete="current-password"
            />
            <div className="flex justify-end pt-1">
              <Link
                href="/auth/forgot-password"
                className="text-xs font-semibold text-primary hover:text-primary/90 hover:underline transition-colors"
              >
                Esqueceu a palavra-passe?
              </Link>
            </div>
          </div>

          {mfaRequired && (
            <Input
              label="Código de verificação (MFA)"
              startIcon="ShieldCheck"
              type="text"
              inputMode="numeric"
              placeholder="123456 ou código de recuperação"
              {...register("mfaCode")}
              autoComplete="one-time-code"
              autoFocus
            />
          )}

          <ButtonSubmit
            isLoading={isSubmitting}
            className="w-full h-10 font-semibold gap-2 mt-1"
          >
            {isSubmitting ? (
              "A autenticar..."
            ) : (
              <>
                <span>Entrar</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </ButtonSubmit>
        </div>

        <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border/50">
          Ainda não tem conta da sua produtora?{" "}
          <Link
            href="/auth/register"
            className="font-semibold text-primary hover:text-primary/90 hover:underline transition-colors"
          >
            Registar nova produtora
          </Link>
        </div>
      </form>
    </div>
  );
}
