"use client";

import { Button } from "@/components/ui/button";
import { GlobalModal } from "@/components/modal";
import { useModal } from "@/stores/modal/use-modal-store";
import { RefreshCcw } from "lucide-react";
import { useAuthStore } from "@/stores";
import { useRouter } from "next/navigation";

export function SubscriptionModal() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { closeModal } = useModal();

  const MODAL_ID = "subscription-expired-modal";

  const handleClose = () => {
    closeModal(MODAL_ID);
  };

  const handleRenew = () => {
    handleClose();
    router.push("/subscriptions");
  };

  return (
    <GlobalModal
      id={MODAL_ID}
      canClose={true}
      title={
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-none bg-destructive/10 mt-2">
            <RefreshCcw className="h-7 w-7 text-destructive" />
          </div>

          <div className="text-center space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Subscrição Expirada — Modo Apenas Leitura
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
              Olá {user?.name || "Utilizador"}, a subscrição da sua organização expirou. Pode continuar a consultar todos os seus projectos e registos gravados anteriormente, mas a criação de novos conteúdos está suspensa.
            </p>
          </div>
        </div>
      }
      className="p-6 bg-card rounded-none border border-border shadow-lg sm:max-w-md text-center"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="flex flex-col gap-2.5 pt-2 w-full">
          <Button
            size="default"
            className="w-full text-xs font-semibold rounded-none h-9"
            onClick={handleRenew}
          >
            Regularizar Subscrição
          </Button>

          <Button
            variant="outline"
            className="w-full text-xs rounded-none h-9 text-muted-foreground hover:text-foreground"
            onClick={handleClose}
          >
            Continuar a Consultar (Apenas Leitura)
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}
