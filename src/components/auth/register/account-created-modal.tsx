"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useModal, useAuthStore } from "@/stores";
import { Button } from "@/components/ui";
import { GlobalModal } from "@/components/modal";
import { loginAction } from "@/actions/login";
import { SucessMessage } from "@/utils/messages";
import { LogIn } from "lucide-react";

interface AccountCreatedData {
  email?: string;
  password?: string;
  redirectPath?: string;
}

export function AccountCreatedModal() {
  const { closeModal, modalData } = useModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const data = (modalData["account-created"] || {}) as AccountCreatedData;

  const handleLoginNow = async () => {
    try {
      setIsLoading(true);

      // Se temos credenciais e for necessário sincronizar nova sessão via loginAction
      if (data.email && data.password) {
        try {
          const result = await loginAction({ email: data.email, password: data.password });
          if (result.user) {
            setUser(result.user);
          }
        } catch {
          // Mantém a sessão já criada no processo de registo
        }
      }

      closeModal("account-created");
      SucessMessage("Sessão iniciada com sucesso! A aceder ao painel...");
      router.push(data.redirectPath || "/dashboard");
    } catch (error) {
      console.error("Erro ao iniciar sessão a partir do modal:", error);
      closeModal("account-created");
      router.push(data.redirectPath || "/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLoginPage = () => {
    closeModal("account-created");
    router.push("/auth/login");
  };

  return (
    <GlobalModal
      sucess
      canClose={false}
      id="account-created"
      title="Produtora criada com sucesso!"
      className="!max-w-md text-center"
      description="A sua conta e produtora foram configuradas com sucesso. Deseja iniciar sessão agora?"
    >
      <div className="flex flex-col items-center justify-center pt-2 pb-1 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Pode aceder de imediato ao seu espaço de trabalho ou iniciar sessão mais tarde.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoToLoginPage}
            disabled={isLoading}
            className="flex-1 order-2 sm:order-1"
          >
            Ir para o Login
          </Button>
          <Button
            type="button"
            onClick={handleLoginNow}
            loading={isLoading}
            className="flex-1 bg-primary hover:bg-primary/90 font-semibold gap-2 order-1 sm:order-2"
          >
            <LogIn className="size-4" />
            Entrar Agora
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}
