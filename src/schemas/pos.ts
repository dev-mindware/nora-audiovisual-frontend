import { z } from 'zod';

export const posRequestOpeningSchema = z.object({
  message: z.string().min(1, 'A mensagem é obrigatória'),
});

export type PosRequestOpeningFormData = z.infer<typeof posRequestOpeningSchema>;

export const posRegisterExpenseSchema = z.object({
  description: z.string().min(1, 'A descrição é obrigatória'),
  amount: z.coerce.number().positive('O valor deve ser maior que zero'),
});

export type PosRegisterExpenseFormData = z.infer<typeof posRegisterExpenseSchema>;

export const posCloseSessionSchema = z.object({
  closingCash: z.coerce.number().min(0, 'O valor de fecho deve ser pelo menos 0'),
  totalSales: z.coerce.number(),
  notes: z.string().optional(),
});

export type PosCloseSessionFormData = z.infer<typeof posCloseSessionSchema>;
