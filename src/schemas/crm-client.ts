import { z } from 'zod';

export const crmClientSchema = z.object({
  name: z.string().min(2, 'O nome ou razão social é obrigatório'),
  legalName: z.string().optional(),
  taxId: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type CrmClientFormData = z.infer<typeof crmClientSchema>;
