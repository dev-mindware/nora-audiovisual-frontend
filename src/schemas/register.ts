import { z } from "zod";
import { companySchema } from "./company";
import { passwordSchema, phoneNumberSchema } from "./helps";

export const registerSchema = z.object({
  step1: z
    .object({
      name: z
        .string()
        .trim()
        .nonempty("Campo obrigatorio")
        .min(3, "No minimo 3 caracters"),
      email: z
        .string()
        .email("Email inválido")
        .transform((email) => email.toLowerCase().trim()),
      phone: phoneNumberSchema,
      password: passwordSchema,
      passwordConfirmation: z
        .string()
        .trim()
        .nonempty("Campo obrigatorio")
        .min(3, "No minimo 3 caracters"),
      affiliateCode: z
        .string()
        .trim()
        .transform((val) => (val === "" ? undefined : val))
        .optional()
        .refine((val) => !val || /^MWD-AO-\d+$/.test(val), {
          message: "Código inválido. Formato correto: MWD-AO-1234",
        }),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: "As palavras-passe não coincidem",
      path: ["passwordConfirmation"],
    }),
  step2: z.object({
    company: companySchema,
  }),
  step3: z.object({
    terms: z.literal(true, {
      errorMap: () => ({ message: "Deve aceitar os termos" }),
    }),
  }),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const registerActionSchema = z.object({
  name: z.string().trim().min(2, "O nome deve conter pelo menos 2 caracteres."),
  email: z.string().trim().email("Endereço de email inválido."),
  password: z.string().min(8, "A palavra-passe deve conter pelo menos 8 caracteres."),
  organizationName: z.string().trim().min(2, "O nome da organização é obrigatório."),
  organizationSlug: z.string().trim().optional(),
  taxId: z.string().trim().optional(),
  planCode: z.enum(["INICIAL", "PROFISSIONAL", "BUSINESS"]).default("INICIAL").optional(),
});

export type RegisterActionInput = z.infer<typeof registerActionSchema>;
