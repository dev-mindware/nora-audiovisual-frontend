import { z } from 'zod';

export const createDeliverableSchema = z.object({
  projectId: z.string().min(1, 'Selecione o projeto'),
  title: z.string().min(2, 'O título do entregável é obrigatório'),
  type: z.enum([
    'FINAL_MASTER',
    'PHOTOSHOOT',
    'TEASER',
    'TRAILER',
    'SOCIAL_CUT',
    'ROUGH_CUT',
    'RAW',
  ]),
  includedPhotosCount: z.coerce.number().min(0).optional(),
  extraPhotoPrice: z.coerce.number().min(0).optional(),
  allowExtraPurchase: z.boolean().optional(),
  notes: z.string().optional(),
});

export type DeliverableFormData = z.infer<typeof createDeliverableSchema>;
