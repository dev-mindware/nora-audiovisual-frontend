"use client"
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui";
import { RegisterFormData } from "@/schemas";
import { useFormContext } from "react-hook-form";
import { StepsHeader } from "./steps-header";

export function SecondStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegisterFormData>();
  const companyPhoneField = register("step2.company.phone");

  return (
    <div className={cn("flex flex-col gap-6")}>
      <div className="flex flex-col items-center mt-4 gap-2 text-center">
        <StepsHeader title="Dados da Produtora" />
        <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
          Todo o processo fiscal e enquadramento de NIF é gerido e sincronizado centralmente no Mindgest.
        </p>
      </div>
      <div className="grid gap-6">
        <Input
          startIcon="Building"
          label="Nome da produtora ou estúdio"
          placeholder="Introduza o nome ou a designação comercial"
          {...register("step2.company.name")}
          error={
            errors?.step2?.company?.name &&
            errors?.step2?.company?.name?.message
          }
        />
        <Input
          type="email"
          label="Email de contacto"
          startIcon="Mail"
          placeholder="Introduza o endereço de email"
          {...register("step2.company.email")}
          error={
            errors?.step2?.company?.email &&
            errors?.step2?.company?.email?.message
          }
        />
        <Input
          label="Telefone"
          inputMode="numeric"
          startIcon="Phone"
          placeholder="Introduza o número de telefone"
          {...companyPhoneField}
          onChange={(e) => {
            // Bloqueia tudo o que não for dígito antes de chegar ao input/form
            e.target.value = e.target.value.replace(/\D/g, "");
            companyPhoneField.onChange(e);
          }}
          error={
            errors?.step2?.company?.phone &&
            errors?.step2?.company?.phone?.message
          }
        />
        <Input
          label="Endereço"
          startIcon="MapPin"
          placeholder="Introduza o endereço"
          {...register("step2.company.address")}
          error={
            errors?.step2?.company?.address &&
            errors?.step2?.company?.address?.message
          }
        />
      </div>     
    </div>
  );
}
