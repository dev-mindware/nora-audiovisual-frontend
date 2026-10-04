"use client";

import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { GlobalModal, Button, ButtonSubmit, Textarea } from "@/components";
import { useModal, currentStoreStore } from "@/stores";
import { cashSessionsService } from "@/services/cash-sessions-service";
import { ErrorMessage, SucessMessage, WarningMessage } from "@/utils/messages";
import { isDuplicateOpeningRequestError } from "@/utils/cash-session";
import { posRequestOpeningSchema, PosRequestOpeningFormData } from "@/schemas";

export const MODAL_POS_REQUEST_OPENING_ID = "pos-request-opening-modal";

export function PosRequestOpeningModal() {
  const { closeModal } = useModal();
  const { currentStore } = currentStoreStore();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PosRequestOpeningFormData>({
    resolver: zodResolver(posRequestOpeningSchema),
  });

  const handleCancel = () => {
    closeModal(MODAL_POS_REQUEST_OPENING_ID);
    reset();
  };

  const onSubmit = async (data: PosRequestOpeningFormData) => {
    if (!currentStore?.id) {
      ErrorMessage("Loja não identificada. Contacte o suporte.");
      return;
    }

    try {
      await cashSessionsService.requestOpening({
        storeId: currentStore.id,
        message: data.message,
      });
      SucessMessage("Pedido de abertura de sessão enviado com sucesso.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["opening-requests"] }),
        queryClient.invalidateQueries({
          queryKey: ["reports", "dashboard", "pos-management"],
        }),
      ]);
      handleCancel();
    } catch (err: any) {
      const apiMessage = String(err?.response?.data?.message || "");

      if (isDuplicateOpeningRequestError(err)) {
        WarningMessage(
          "Já solicitou a abertura de caixa. Aguarde a aprovação do pedido pendente.",
        );
        return;
      }

      ErrorMessage(apiMessage || "Não foi possível enviar o pedido.");
    }
  };

  return (
    <GlobalModal
      id={MODAL_POS_REQUEST_OPENING_ID}
      title="Solicitar Abertura de Caixa"
      description="Envie uma mensagem ao gerente solicitando a abertura."
      className="!w-max"
      footer={
        <div className="flex justify-end gap-2 w-full pt-1">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <ButtonSubmit
            form="pos-request-opening-form"
            isLoading={isSubmitting}
          >
            Enviar pedido
          </ButtonSubmit>
        </div>
      }
    >
      <form
        id="pos-request-opening-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Textarea
          label="Mensagem"
          placeholder="Ex: Preciso abrir o caixa para o turno da tarde."
          error={errors.message?.message}
          {...register("message")}
        />
      </form>
    </GlobalModal>
  );
}
