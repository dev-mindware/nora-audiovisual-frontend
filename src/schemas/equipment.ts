import { z } from 'zod';

export const createEquipmentSchema = z.object({
  name: z.string().min(2, 'O nome do equipamento é obrigatório'),
  code: z.string().optional(),
  category: z.enum([
    'CAMERA',
    'LENS',
    'LIGHTING',
    'AUDIO',
    'GRIP',
    'DRONE',
    'ACCESSORY',
  ]),
  serialNumber: z.string().optional(),
  ownershipType: z.enum(['OWNED', 'RENTED']),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED']),
  location: z.string().optional(),
  dailyRate: z.coerce.number().min(0).optional(),
});

export const checkoutSchema = z.object({
  initialCondition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED']),
  notes: z.string().optional(),
});

export const checkinSchema = z.object({
  returnCondition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED']),
  damageNotes: z.string().optional(),
  notes: z.string().optional(),
});

export const reservationSchema = z.object({
  projectId: z.string().optional(),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().min(1, 'Data de devolução é obrigatória'),
});

export type EquipmentFormData = z.infer<typeof createEquipmentSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type CheckinFormData = z.infer<typeof checkinSchema>;
export type ReservationFormData = z.infer<typeof reservationSchema>;
