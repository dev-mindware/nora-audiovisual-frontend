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
} from "lucide-react";
import { registerAction } from "@/actions/register";
import { registerActionSchema, type RegisterActionInput } from "@/schemas";
import { Input, Button, ButtonSubmit } from "@/components/ui";
import { PasswordStrengthBar } from "@/components/auth/_components";
import { useAuthStore } from "@/stores";
import { useTenantStore } from "@/stores/tenant";
import { ErrorMessage, SucessMessage } from "@/utils/messages";
import { queryClient } from "@/lib";

interface PlanOption {
  code: "INICIAL" | "PROFISSIONAL" | "BUSINESS";
  name: string;
  popular?: boolean;
  tagline: string;
  price: string;
  features: string[];
}

const PLANS: PlanOption[] = [
  {
    code: "INICIAL",
    name: "Inicial",
    tagline: "Para pequenos estúdios e freelancers independentes",
    price: "25.000",
    features: [
      "Até 3 utilizadores",
      "5 projectos activos",
      "50 GB de armazenamento",
      "Gestão de equipamentos básica",
    ],
  },
  {
    code: "PROFISSIONAL",
    name: "Profissional",
    popular: true,
    tagline: "Para produtoras em expansão com equipa técnica",
    price: "45.000",
    features: [
      "Até 10 utilizadores",
      "Projectos ilimitados",
      "500 GB de armazenamento",
      "Folhas de Chamada & PDF",
      "Portal do Cliente com Timecode",
      "1.000 créditos de IA inclusos",
    ],
  },
  {
    code: "BUSINESS",
    name: "Business",
    tagline: "Para agências criativas e grandes operações",
    price: "85.000",
    features: [
      "Utilizadores ilimitados",
      "2 TB de armazenamento",
      "Check-out / Check-in com QR",
      "Facturação integrada Mindgest",
      "Auditoria avançada e SLA prioritário",
      "Créditos de IA expandidos",
    ],
  },
];

export function RegisterFlow() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const { setUser, setIsAuthenticating } = useAuthStore();
  const { setActiveOrganization, setOrganizations } = useTenantStore();

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
      planCode: "PROFISSIONAL",
    },
  });

  const watchedPassword = watch("password");
  const watchedPlanCode = watch("planCode");

  const handleNext = async () => {
    if (step === 1) {
      const isValid = await trigger(["name", "email", "password"]);
      if (isValid) setStep(2);
    } else if (step === 2) {
      const isValid = await trigger(["organizationName", "organizationSlug", "taxId"]);
      if (isValid) setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2);
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
      const res = await registerAction(data);

      if (!res.user) {
        setIsAuthenticating(false);
        ErrorMessage(res.error || "Falha ao registar produtora. Tente novamente.");
        return;
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
            id: m.organizationId,
            name: m.organizationName || "Organização",
            role: m.roleId,
          }))
        );
      }

      queryClient.setQueryData(["user"], res.user);
      setUser(res.user);

      SucessMessage(res.message || "Produtora registada com sucesso! Bem-vindo(a).");
      router.replace(res.redirectPath || "/dashboard");
    } catch (err: any) {
      setIsAuthenticating(false);
      ErrorMessage(err.message || "Erro inesperado ao registar. Tente novamente.");
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto my-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 text-left">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Criar Conta Nora
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step === 1 && "Passo 1 de 3 — Configure os seus dados de acesso de titular."}
            {step === 2 && "Passo 2 de 3 — Identifique a sua produtora e workspace."}
            {step === 3 && "Passo 3 de 3 — Selecione o plano adequado para a operação."}
          </p>
        </div>
      </div>

      {/* Stepper Dots */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
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

            <div className="flex flex-col space-y-2">
              <Input
                type="password"
                label="Palavra-passe"
                startIcon="Lock"
                placeholder="Mínimo 15 caracteres (NIST SP 800-63B)"
                {...register("password")}
                error={errors.password?.message}
                autoComplete="new-password"
              />
              <PasswordStrengthBar password={watchedPassword || ""} />
            </div>
          </div>
        )}

        {/* STEP 2: PRODUTORA & TENANT */}
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

            <Input
              label="NIF / Identificação Fiscal (Opcional)"
              startIcon="FileText"
              placeholder="5412345678"
              {...register("taxId")}
              error={errors.taxId?.message}
            />
          </div>
        )}

        {/* STEP 3: PLANO SAAS */}
        {step === 3 && (
          <div className="flex flex-col gap-3 animate-in fade-in duration-300">
            <span className="text-xs text-muted-foreground text-left mb-1">
              Todos os planos incluem 7 dias de teste sem compromisso.
            </span>

            {PLANS.map((plan) => {
              const isSelected = watchedPlanCode === plan.code;
              return (
                <div
                  key={plan.code}
                  onClick={() => setValue("planCode", plan.code, { shouldValidate: true })}
                  className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs"
                      : "border-border bg-card hover:border-border/80 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-background"
                        }`}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <span className="font-semibold text-foreground text-sm">
                        {plan.name}
                      </span>
                      {plan.popular && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                          Recomendado
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-foreground text-sm">
                        {plan.price}
                      </span>
                      <span className="text-xs text-muted-foreground"> Kz/mês</span>
                    </div>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground pl-6">
                    {plan.tagline}
                  </p>

                  <div className="mt-2.5 grid grid-cols-2 gap-1.5 pl-6">
                    {plan.features.slice(0, 4).map((f, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
                      >
                        <Check className="h-3 w-3 text-primary shrink-0" />
                        <span className="truncate">{f}</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
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
              className="gap-1.5 h-10 px-4"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 h-10 font-semibold gap-2"
            >
              <span>Continuar</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <ButtonSubmit
              isLoading={isSubmitting}
              className="flex-1 h-10 font-semibold gap-2"
            >
              {isSubmitting ? (
                "A criar produtora..."
              ) : (
                <>
                  <span>Concluir e Começar</span>
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
    </div>
  );
}
