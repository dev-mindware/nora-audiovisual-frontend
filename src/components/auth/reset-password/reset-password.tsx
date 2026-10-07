"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wand2 } from "lucide-react";
import { ButtonSubmit, Input } from "@/components/ui";
import { ResetPasswordSkeleton } from "@/components/common/skeletons/reset-password-skeleton";
import { ResetPasswordFormData, resetPasswordSchema } from "@/schemas";
import { ErrorMessage } from "@/utils/messages";
import { useResetPassword } from "@/hooks/auth";
import { PasswordStrengthBar } from "../_components";
import { useModal } from "@/stores";
import { SuccessResetModal } from "./success-reset-modal";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { openModal } = useModal();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const newPassword = watch("newPassword") || "";

  const generateStrongPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue("newPassword", pass, { shouldValidate: true });
    setValue("confirmPassword", pass, { shouldValidate: true });
  };

  const { mutateAsync: resetPassword, isPending } = useResetPassword();

  async function onChangePassword(data: ResetPasswordFormData) {
    if (!token) {
      ErrorMessage(
        "O código de recuperação da palavra-passe não foi encontrado ou é inválido. Solicite uma nova recuperação."
      );
      return;
    }

    try {
      await resetPassword({
        token,
        newPassword: data.newPassword,
      });
      openModal("success-reset-modal");
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message ||
          "Não foi possível alterar a palavra-passe. Tente novamente mais tarde."
      );
    }
  }

  return (
    <>
      <div className="w-full max-w-sm mx-auto my-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2.5 text-left">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Nova Palavra-passe
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Introduza e confirme a nova palavra-passe para recuperar o acesso à sua conta.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onChangePassword)} className="flex flex-col gap-5">
          <div className="grid gap-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Nova palavra-passe</span>
                <button
                  type="button"
                  onClick={generateStrongPassword}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/90 transition-colors"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  <span>Gerar segura</span>
                </button>
              </div>

              <Input
                type="password"
                startIcon="Lock"
                placeholder="Introduza a nova palavra-passe"
                {...register("newPassword")}
                error={errors.newPassword?.message}
                autoFocus
              />

              <PasswordStrengthBar password={newPassword} />
            </div>

            <Input
              type="password"
              label="Confirmar nova palavra-passe"
              startIcon="Lock"
              placeholder="Confirme a nova palavra-passe"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />

            <ButtonSubmit
              isLoading={isPending}
              className="w-full h-10 font-semibold gap-2 mt-1"
            >
              {isPending ? "A redefinir..." : "Confirmar Nova Palavra-passe"}
            </ButtonSubmit>
          </div>

          <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border/50">
            Lembrou-se da palavra-passe?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-primary hover:text-primary/90 hover:underline transition-colors"
            >
              Voltar ao login
            </Link>
          </div>
        </form>
      </div>

      <SuccessResetModal />
    </>
  );
}

export function ResetPassword() {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
