import { z } from 'zod';

export const budgetItemSchema = z.object({
  category: z.enum([
    'CREW',
    'EQUIPMENT',
    'STUDIO',
    'TRANSPORT',
    'CATERING',
    'POST_PRODUCTION',
    'MISC',
  ]),
  description: z.string().min(1, 'Descrição é obrigatória'),
  quantity: z.coerce.number().min(1),
  unitPrice: z.coerce.number().min(0),
});

export const budgetFormSchema = z.object({
  clientId: z.string().min(1, 'Selecione o cliente'),
  projectId: z.string().optional(),
  discount: z.coerce.number().min(0).optional(),
  validUntil: z.string().optional(),
  items: z.array(budgetItemSchema).min(1, 'Adicione pelo menos um item ao orçamento'),
});

export type BudgetItemData = z.infer<typeof budgetItemSchema>;
export type BudgetFormData = z.infer<typeof budgetFormSchema>;
