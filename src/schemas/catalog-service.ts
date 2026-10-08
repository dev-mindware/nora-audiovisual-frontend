import { z } from 'zod';

export const catalogServiceCategoryEnum = z.enum([
  'VIDEO_PRODUCTION',
  'PHOTOGRAPHY',
  'POST_PRODUCTION',
  'STUDIO_RENTAL',
  'LIVE_STREAMING',
  'COMMERCIAL',
  'MUSIC_VIDEO',
  'CORPORATE',
  'EVENT',
  'PODCAST',
  'COLOR_GRADING',
  'AUDIO_MASTERING',
  'DRONE_FOOTAGE',
  'OTHER',
]);

export const catalogServiceFormSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  category: catalogServiceCategoryEnum,
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'O valor não pode ser negativo'),
  currency: z.string().default('AOA'),
  durationHours: z.coerce.number().min(0).optional(),
  benefits: z.array(z.string()).default([]),
  deliverablesIncluded: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export type CatalogServiceFormData = z.infer<typeof catalogServiceFormSchema>;
