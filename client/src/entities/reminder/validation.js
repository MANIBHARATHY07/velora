import { z } from 'zod';

export const reminderSchema = z.object({
  type: z.enum(['service', 'insurance', 'puc', 'emi', 'warranty']),
  title: z.string().min(1, 'Title is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
});

/** @typedef {z.infer<typeof reminderSchema>} ReminderInput */
