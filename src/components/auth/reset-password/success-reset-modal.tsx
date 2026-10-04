"use client";

import { useModal } from "@/stores";
import { Button } from "@/components/ui";
import { GlobalModal } from "@/components/modal";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function SuccessResetModal() {
  const { closeModal } = useModal();
  const router = useRouter();

  function handleGoToLogin() {
    closeModal("success-reset-modal");
    router.replace("/auth/login");
  }

  return (
    <GlobalModal
      id="success-reset-modal"
      className="p-6 max-w-md text-center"
      title={
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <span className="text-xl font-bold tracking-tight">Palavra-passe alterada</span>
        </div>
      }
      description={
        <span className="text-sm text-muted-foreground block text-center mt-1">
          A palavra-passe foi redefinida com sucesso. Já pode aceder ao seu workspace com as novas credenciais.
        </span>
      }
      footer={
        <Button variant="default" onClick={handleGoToLogin}>
          Iniciar sessão
        </Button>
      }
    />
  );
}
