"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GlobalModal,
  Button,
  ButtonSubmit,
  Textarea,
  InputCurrency,
} from "@/components";
import { useModal, currentStoreStore } from "@/stores";
import { cashSessionsService } from "@/services/cash-sessions-service";
import { SucessMessage } from "@/utils/messages";
import { CashSession } from "@/types/cash-session";
import { ErrorMessage, getApiErrorMessage } from "@/utils";
import { posRegisterExpenseSchema, PosRegisterExpenseFormData } from "@/schemas";

export const MODAL_POS_REGISTER_EXPENSE_ID = "pos-register-expense-modal";

interface PosRegisterExpenseModalProps {
  currentSession?: CashSession;
}

export function PosRegisterExpenseModal({ currentSession }: PosRegisterExpenseModalProps) {
  const { closeModal } = useModal();
  const { currentStore } = currentStoreStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PosRegisterExpenseFormData>({
    resolver: zodResolver(posRegisterExpenseSchema),
  });

  const handleCancel = () => {
    closeModal(MODAL_POS_REGISTER_EXPENSE_ID);
    reset();
  };

  const onSubmit = async (data: PosRegisterExpenseFormData) => {
    if (!currentStore?.id || !currentSession?.id) {
      return;
    }

    try {
      setIsLoading(true);
      await cashSessionsService.registerExpense({
        description: data.description,
        amount: data.amount,
        cashSessionId: currentSession.id,
      });
      SucessMessage("Despesa registada com sucesso!");
      handleCancel();
    } catch (err: any) {
      console.error(err);
      ErrorMessage(getApiErrorMessage(err, "Não foi possível registar a despesa."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlobalModal
      id={MODAL_POS_REGISTER_EXPENSE_ID}
      title="Registar Despesa"
      description="Introduza a descrição e o valor da despesa."
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
            form="pos-register-expense-form"
            isLoading={isLoading}
          >
            Registar Despesa
          </ButtonSubmit>
        </div>
      }
    >
      <form
        id="pos-register-expense-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Textarea
          label="Descrição"
          placeholder="Ex: Material de escritório, Limpeza, etc."
          error={errors.description?.message}
          {...register("description")}
        />

        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <InputCurrency
              ref={field.ref}
              label="Valor"
              placeholder="0,00"
              value={field.value}
              onValueChange={(val) => field.onChange(val)}
              error={errors.amount?.message}
            />
          )}
        />
      </form>
    </GlobalModal>
  );
}
