import { z } from 'zod';

export const addMemberSchema = z.object({
  userId: z.string().min(1, 'Selecione o profissional da organização'),
  projectRole: z.string().min(2, 'Selecione ou insira a função audiovisual'),
});

export type MemberFormData = z.infer<typeof addMemberSchema>;
