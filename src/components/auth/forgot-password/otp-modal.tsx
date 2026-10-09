"use client";

import { Button } from "@/components/ui";
import { GlobalModal } from "@/components/modal";
import { useModal } from "@/stores";
import { MailCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export function OTPModal({ message }: { message: string }) {
  const { closeModal } = useModal();
  const router = useRouter();

  function handleGoToLogin() {
    closeModal("information-modal");
    router.replace("/auth/login");
  }

  return (
    <GlobalModal
      id="information-modal"
      className="p-6 max-w-md text-center"
      title={
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="h-7 w-7" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Verifique o seu email</span>
        </div>
      }
      description={
        <span className="text-sm text-muted-foreground block text-center mt-1">
          {message ||
            "Enviámos as instruções para recuperar a sua palavra-passe. Verifique a caixa de entrada e a pasta de correio não solicitado."}
        </span>
      }
      footer={
        <Button variant="default" onClick={handleGoToLogin}>
          Entendido
        </Button>
      }
    />
    
  );
}
