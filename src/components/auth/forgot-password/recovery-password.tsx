"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ButtonSubmit, Input } from "@/components/ui";
import { useModal } from "@/stores/modal/use-modal-store";
import { ForgotPasswordFormData, forgotPasswordSchema } from "@/schemas";
import { ErrorMessage } from "@/utils/messages";
import { useForgotPassword } from "@/hooks/auth";
import { OTPModal } from "./otp-modal";
import { ArrowRight } from "lucide-react";

export function RecoveryPassword() {
  const { openModal } = useModal();
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const { mutateAsync: forgotPassword, isPending } = useForgotPassword();

  async function onSubmit(data: ForgotPasswordFormData) {
    try {
      const res = await forgotPassword(data.email);
      setMessage(res.message);
      openModal("information-modal");
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message ||
          "Ocorreu um erro ao enviar o email. Tente mais tarde."
      );
    }
  }

  return (
    <>
      <div className="w-full max-w-sm mx-auto my-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2.5 text-left">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Recuperar Palavra-passe
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Introduza o seu email profissional para receber as instruções de recuperação.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="grid gap-4">
            <Input
              label="Email Profissional"
              type="email"
              startIcon="Mail"
              placeholder="admin@nora-audiovisual.com"
              {...register("email")}
              error={errors.email?.message}
              autoComplete="email"
              autoFocus
            />

            <ButtonSubmit
              isLoading={isPending}
              className="w-full h-10 font-semibold gap-2 mt-1"
            >
              {isPending ? (
                "A enviar instruções..."
              ) : (
                <>
                  <span>Enviar instruções</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
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

      <OTPModal message={message} />
    </>
  );
}
