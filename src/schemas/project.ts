import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(2, 'O título deve ter pelo menos 2 caracteres'),
  clientId: z.string().min(1, 'Selecione ou indique o cliente'),
  serviceId: z.string().optional(),
  productionStage: z.enum([
    'PRE_PRODUCTION',
    'PRODUCTION',
    'POST_PRODUCTION',
    'REVIEW',
    'DELIVERED',
  ]),
  lifecycleStatus: z.enum(['LEAD', 'PLANNING', 'ACTIVE', 'COMPLETED']),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type ProjectFormData = z.infer<typeof createProjectSchema>;
