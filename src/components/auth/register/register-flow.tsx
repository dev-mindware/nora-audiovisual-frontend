"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Wand2,
  ShieldCheck,
  Film,
  Users,
  HardDrive,
  Camera,
  Layers,
} from "lucide-react";
import { registerAction, syncSessionAction, type RegisterActionResult } from "@/actions/register";
import { registerActionSchema, type RegisterActionInput } from "@/schemas";
import { Input, Button, ButtonSubmit, Checkbox } from "@/components/ui";
import { cn } from "@/lib/utils";
import { PasswordStrengthBar } from "@/components/auth/_components";
import { useAuthStore, useModal } from "@/stores";
import { useTenantStore } from "@/stores/tenant";
import { ErrorMessage, SucessMessage } from "@/utils/messages";
import { queryClient } from "@/lib";
import { api } from "@/services/api";
import { AccountCreatedModal } from "./account-created-modal";

export function RegisterFlow() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  const { setUser, setIsAuthenticating } = useAuthStore();
  const { setActiveOrganization, setOrganizations } = useTenantStore();
  const { openModal } = useModal();

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterActionInput>({
    resolver: zodResolver(registerActionSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      organizationName: "",
      organizationSlug: "",
      taxId: "",
      planCode: "INICIAL",
      acceptTerms: false as any,
    },
  });

  const watchedPassword = watch("password");

  const generateStrongPassword = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";
    const all = upper + lower + numbers + symbols;

    const pass = [
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      numbers[Math.floor(Math.random() * numbers.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];

    for (let i = 4; i < 16; i++) {
      pass.push(all[Math.floor(Math.random() * all.length)]);
    }

    const shuffled = pass.sort(() => 0.5 - Math.random()).join("");
    setValue("password", shuffled, { shouldValidate: true });
    SucessMessage("Palavra-passe forte gerada com sucesso!");
  };

  const handleNext = async () => {
    if (step === 1) {
      const isValid = await trigger(["name", "email", "password"]);
      if (isValid) setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("organizationName", val, { shouldValidate: true });

    // Sugere slug automaticamente se ainda não alterado manualmente
    const currentSlug = watch("organizationSlug");
    if (!currentSlug || currentSlug === slugify(val.slice(0, -1))) {
      setValue("organizationSlug", slugify(val), { shouldValidate: false });
    }
  };

  function slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function handleRegister(data: RegisterActionInput) {
    try {
      setIsAuthenticating(true);

      // 1. Sanitiza campos opcionais e fixa plano inicial com trial automático
      const cleanData: RegisterActionInput = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        organizationName: data.organizationName.trim(),
        planCode: "INICIAL",
        acceptTerms: data.acceptTerms,
      };
      if (data.organizationSlug?.trim()) {
        cleanData.organizationSlug = data.organizationSlug.trim();
      }
      if (data.taxId?.trim()) {
        cleanData.taxId = data.taxId.trim();
      }

      // 2. Executa a criação da conta (Server Action com fallback direto via API)
      let res: RegisterActionResult;
      try {
        res = await registerAction(cleanData);
      } catch (actionErr: any) {
        // Fallback resiliente: chamada direta via Axios no browser se a Server Action falhar
        const apiRes = await api.post("/auth/register", cleanData);
        const payload = apiRes.data?.data || apiRes.data;
        const token = payload?.token || payload?.accessToken;

        if (token) {
          localStorage.setItem("nora_token", token);
          document.cookie = `nora_token=${token}; path=/; max-age=604800; SameSite=Lax`;
          await syncSessionAction(token, "OWNER").catch(() => null);
        }

        res = {
          user: {
            ...payload.user,
            role: "OWNER",
          },
          activeOrganization: payload.activeOrganization,
          memberships: payload.memberships || payload.organizations,
          redirectPath: "/dashboard",
          token,
          message: "Produtora registada com sucesso! Bem-vindo(a).",
        };
      }

      if (!res.user) {
        setIsAuthenticating(false);
        ErrorMessage(res.error || "Falha ao registar produtora. Tente novamente.");
        return;
      }

      if (res.token) {
        localStorage.setItem("nora_token", res.token);
        document.cookie = `nora_token=${res.token}; path=/; max-age=604800; SameSite=Lax`;
      }

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
            id: m.organizationId || m.id,
            name: m.organizationName || m.name || "Organização",
            role: m.roleId || m.role,
          }))
        );
      }

      queryClient.setQueryData(["user"], res.user);
      setUser(res.user);
      setIsAuthenticating(false);

      // Abre o modal confirmando a criação e perguntando se deseja iniciar sessão (estilo mindgest-frontend)
      openModal("account-created", {
        email: cleanData.email,
        password: cleanData.password,
        redirectPath: res.redirectPath || "/dashboard",
      });
    } catch (err: any) {
      setIsAuthenticating(false);
      const apiMsg = err.response?.data?.message || err.response?.data?.error?.message;
      ErrorMessage(apiMsg || err.message || "Erro inesperado ao registar. Tente novamente.");
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto my-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 text-left">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Criar Conta Nora
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step === 1 && "Passo 1 de 2 — Configure os seus dados de acesso de titular."}
            {step === 2 && "Passo 2 de 2 — Identifique a sua produtora e active o seu teste."}
          </p>
        </div>
      </div>

      {/* Stepper Dots */}
      <div className="flex items-center gap-2">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1.5 rounded-none transition-all duration-300 ${
              s === step
                ? "w-8 bg-primary"
                : s < step
                ? "w-4 bg-primary/50"
                : "w-2 bg-muted"
            }`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit(handleRegister)} className="flex flex-col gap-5">
        {/* STEP 1: DADOS DO TITULAR */}
        {step === 1 && (
          <div className="grid gap-4 animate-in fade-in duration-300">
            <Input
              label="Nome Completo"
              startIcon="User"
              placeholder="Ex: Carlos Gomes"
              {...register("name")}
              error={errors.name?.message}
              autoFocus
              autoComplete="name"
            />

            <Input
              type="email"
              label="Email Profissional"
              startIcon="Mail"
              placeholder="carlos@produtora.ao"
              {...register("email")}
              error={errors.email?.message}
              autoComplete="email"
            />

            <div className="space-y-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Palavra-passe
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="password"
                      startIcon="Lock"
                      placeholder="Mínimo de 8 caracteres"
                      {...register("password")}
                      autoComplete="new-password"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0 h-10 w-10"
                    title="Gerar palavra-passe forte"
                    onClick={generateStrongPassword}
                  >
                    <Wand2 className="size-4 text-primary" />
                  </Button>
                </div>
              </div>

              <PasswordStrengthBar password={watchedPassword || ""} />

              {errors.password?.message && (
                <p className="text-xs text-destructive font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: PRODUTORA & TRIAL AUTOMÁTICO COM PACOTE INICIAL */}
        {step === 2 && (
          <div className="grid gap-4 animate-in fade-in duration-300">
            <Input
              label="Nome da Produtora / Estúdio"
              startIcon="Building"
              placeholder="Ex: Luanda Light & Sound"
              {...register("organizationName")}
              onChange={handleOrgNameChange}
              error={errors.organizationName?.message}
              autoFocus
            />

            <Input
              label="Endereço de Acesso (Slug)"
              startIcon="Globe"
              placeholder="luanda-sound"
              {...register("organizationSlug")}
              error={errors.organizationSlug?.message}
            />

            {/* Trial & Benefícios do Pacote Inicial */}
            <div className="rounded-none border border-primary/20 bg-primary/5 p-4 text-xs text-foreground space-y-3">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                <span>Trial de 7 Dias — Pacote Inicial Activado</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                A sua produtora terá acesso imediato a todos os recursos do <strong className="text-foreground">Plano Inicial</strong> sem custos e sem cartão de crédito:
              </p>

              <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1">
                <div className="flex items-center gap-1.5">
                  <Film className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>5 Projectos activos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Até 3 utilizadores</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>50 GB armazenamento</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>50 Equipamentos</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <Layers className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Portal do Cliente & Timecode</span>
                </div>
              </div>
            </div>

            <div className="rounded-none border border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Gestão Fiscal Mindgest:</span> Os dados fiscais e de facturação (NIF, enquadramento de IVA AGT e SAF-T) serão geridos e sincronizados centralmente através do conector certificado Mindgest.
            </div>

            {/* Checkbox de Aceitação Legal de Angola (Termos & Políticas) */}
            <div className="space-y-1.5 pt-1">
              <div
                className={cn(
                  "flex items-start gap-3 p-3.5 border rounded-none bg-card/60 transition-colors",
                  errors.acceptTerms
                    ? "border-destructive bg-destructive/5"
                    : "border-border/70 hover:border-primary/50"
                )}
              >
                <Checkbox
                  id="acceptTerms"
                  checked={watch("acceptTerms") === true}
                  onCheckedChange={(checked) => {
                    setValue("acceptTerms", checked === true ? true : (false as any), {
                      shouldValidate: true,
                    });
                  }}
                  className="mt-0.5 rounded-none shrink-0"
                />
                <label
                  htmlFor="acceptTerms"
                  className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none"
                >
                  Declaro que li, compreendi e aceito integralmente os{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                  >
                    Termos de Utilização do Serviço
                  </Link>{" "}
                  e a{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                  >
                    Política de Privacidade e Protecção de Dados
                  </Link>{" "}
                  ao abrigo da Lei n.º 22/11 (LPDP) e da legislação aplicável na República de Angola.
                </label>
              </div>
              {errors.acceptTerms?.message && (
                <p className="text-xs text-destructive font-medium pl-1">
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
              className="gap-1.5 h-10 px-4 rounded-none font-semibold"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
          )}

          {step === 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 h-10 font-semibold gap-2 rounded-none"
            >
              <span>Continuar</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <ButtonSubmit
              isLoading={isSubmitting}
              className="flex-1 h-10 font-semibold gap-2 rounded-none"
            >
              {isSubmitting ? (
                "A criar produtora..."
              ) : (
                <>
                  <span>Criar Produtora & Começar</span>
                  <Sparkles className="h-4 w-4" />
                </>
              )}
            </ButtonSubmit>
          )}
        </div>

        {/* Footer Link */}
        <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border/50">
          Já tem uma conta registada?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-primary hover:text-primary/90 hover:underline transition-colors"
          >
            Iniciar sessão
          </Link>
        </div>
      </form>

      <AccountCreatedModal />
    </div>
  );
}
