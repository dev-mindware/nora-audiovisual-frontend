import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(2, 'O título da tarefa é obrigatório'),
  department: z.enum([
    'DIRECTION',
    'CAMERA',
    'SOUND',
    'LIGHTING',
    'PRODUCTION',
    'EDITING',
    'COLOR',
    'ART',
  ], {
    required_error: 'Selecione o departamento',
  }),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
    required_error: 'Selecione a prioridade',
  }),
  columnId: z.string().optional(),
  dueAt: z.string().optional(),
});

export type TaskFormData = z.infer<typeof createTaskSchema>;
