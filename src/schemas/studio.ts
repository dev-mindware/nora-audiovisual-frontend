import { z } from 'zod';

export const studioBookingSchema = z.object({
  projectId: z.string().optional(),
  date: z.string().min(1, 'A data é obrigatória'),
  startTime: z.string().min(1, 'A hora de início é obrigatória'),
  endTime: z.string().min(1, 'A hora de término é obrigatória'),
});

export type StudioBookingFormData = z.infer<typeof studioBookingSchema>;
