import { z } from 'zod';

export const createDeliverableSchema = z.object({
  projectId: z.string().min(1, 'Seleccione o projecto'),
  title: z.string().min(2, 'O título do entregável é obrigatório'),
  type: z.string().min(1, 'Seleccione o tipo de entregável'),
  mediaUrl: z.string().optional(),
  includedPhotosCount: z.coerce.number().min(0).optional(),
  extraPhotoPrice: z.coerce.number().min(0).optional(),
  allowExtraPurchase: z.boolean().optional(),
  hasWatermark: z.boolean().optional(),
  notes: z.string().optional(),
});

export type DeliverableFormData = z.infer<typeof createDeliverableSchema>;
