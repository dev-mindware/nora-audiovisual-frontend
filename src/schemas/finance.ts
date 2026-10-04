import { z } from 'zod';

export const paymentSchema = z.object({
  projectId: z.string().optional(),
  amount: z
    .number({ invalid_type_error: 'Informe um valor válido' })
    .positive('O valor deve ser maior que zero'),
  method: z.enum(['BANK_TRANSFER', 'MULTICAIXA', 'CASH'], {
    required_error: 'Selecione o método de pagamento',
  }),
  status: z.enum(['PAID', 'PENDING', 'PARTIALLY_PAID'], {
    required_error: 'Selecione o estado do pagamento',
  }),
  reference: z.string().optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

export const expenseSchema = z.object({
  projectId: z.string({ required_error: 'Selecione o projeto associado' }).min(1, 'Selecione o projeto associado'),
  category: z.enum(['FOOD', 'FUEL', 'RENTAL', 'PERMITS', 'FREELANCER', 'MISC'], {
    required_error: 'Selecione a categoria da despesa',
  }),
  amount: z
    .number({ invalid_type_error: 'Informe um valor válido' })
    .positive('O valor deve ser maior que zero'),
  date: z.string().min(1, 'A data é obrigatória'),
  description: z.string().min(1, 'Informe a descrição da despesa').max(255),
  receiptUrl: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
