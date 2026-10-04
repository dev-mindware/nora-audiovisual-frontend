"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GlobalModal,
  Button,
  ButtonSubmit,
  Textarea,
  Icon,
  InputCurrency,
} from "@/components";
import { useModal } from "@/stores";
import { useCloseCashSession } from "@/hooks";
import { CashSession } from "@/types/cash-session";
import { ErrorMessage, formatCurrency, getApiErrorMessage } from "@/utils";
import { posCloseSessionSchema, PosCloseSessionFormData } from "@/schemas";

export const MODAL_POS_CLOSE_SESSION_ID = "pos-close-session-modal";

interface PosCloseSessionModalProps {
  currentSession?: CashSession;
}

export function PosCloseSessionModal({ currentSession }: PosCloseSessionModalProps) {
  const { closeModal } = useModal();
  const { mutateAsync: closeSession, isPending: isLoading } = useCloseCashSession();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PosCloseSessionFormData>({
    resolver: zodResolver(posCloseSessionSchema),
    defaultValues: {
      totalSales: currentSession?.totalSales || 0,
      closingCash: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (currentSession) {
      setValue("totalSales", currentSession.totalSales || 0);
    }
  }, [currentSession, setValue]);

  const handleCancel = () => {
    closeModal(MODAL_POS_CLOSE_SESSION_ID);
    reset();
  };

  const onSubmit = async (data: PosCloseSessionFormData) => {
    if (!currentSession?.id) {
      return;
    }

    try {
      await closeSession({
        id: currentSession.id,
        data: {
          closingCash: data.closingCash,
          totalSales: data.totalSales,
          notes: data.notes || "",
        },
      });
      handleCancel();
    } catch (err: any) {
      console.error(err);
      ErrorMessage(getApiErrorMessage(err, "Não foi possível fechar a sessão de caixa."));
    }
  };

  return (
    <GlobalModal
      id={MODAL_POS_CLOSE_SESSION_ID}
      title="Fechar Sessão de Caixa"
      description="Confirme os valores finais e encerre a sessão actual."
      className="!w-max"
      footer={
        <div className="flex justify-end gap-2 w-full pt-1">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <ButtonSubmit
            form="pos-close-session-form"
            isLoading={isLoading}
            variant="destructive"
          >
            Fechar Sessão
          </ButtonSubmit>
        </div>
      }
    >
      <form
        id="pos-close-session-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 min-w-[350px]"
      >
        <div className="p-4 bg-muted/30 rounded-lg border border-primary/5 flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total de Vendas
            </p>
            <p className="text-xl font-semibold text-primary">
              {formatCurrency(currentSession?.totalSales || 0)}
            </p>
          </div>
          <div className="p-2 bg-primary/10 rounded-full">
            <Icon name="TrendingUp" className="h-5 w-5 text-primary" />
          </div>
        </div>

        <Controller
          name="closingCash"
          control={control}
          render={({ field }) => (
            <InputCurrency
              ref={field.ref}
              label="Valor em Caixa (Fecho)"
              placeholder="0,00"
              value={field.value}
              onValueChange={(val) => field.onChange(val)}
              error={errors.closingCash?.message}
            />
          )}
        />

        <Textarea
          label="Notas / Observações"
          placeholder="Alguma ocorrência durante o turno?"
          error={errors.notes?.message}
          {...register("notes")}
        />
      </form>
    </GlobalModal>
  );
}
