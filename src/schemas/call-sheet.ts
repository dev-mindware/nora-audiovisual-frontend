import { z } from 'zod';

export const crewCallSlotSchema = z.object({
  name: z.string().min(1, 'Nome do profissional é obrigatório'),
  role: z.string().min(1, 'Função é obrigatória'),
  callTime: z.string().min(1, 'Horário é obrigatório'),
  phone: z.string().optional(),
});

export const createCallSheetSchema = z.object({
  title: z.string().min(2, 'O título da folha é obrigatório'),
  shootDate: z.string().min(1, 'A data de rodagem é obrigatória'),
  generalCallTime: z.string().min(1, 'Horário geral de chamada é obrigatório'),
  location: z.string().min(2, 'A localização do set é obrigatória'),
  weatherForecast: z.string().optional(),
  nearestHospital: z.string().optional(),
  crewMembers: z.array(crewCallSlotSchema).optional(),
});

export type CrewCallSlot = z.infer<typeof crewCallSlotSchema>;
export type CallSheetFormData = z.infer<typeof createCallSheetSchema>;
