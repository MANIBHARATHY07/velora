import { z } from 'zod';

export const serviceRecordSchema = z.object({
  serviceDate: z.string().min(1, 'Service date is required'),
  odometer: z.coerce.number().min(0).optional(),
  workshopName: z.string().min(1, 'Workshop name is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  partsChanged: z.string().optional(),
  labourCost: z.coerce.number().min(0).optional(),
  totalCost: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

/** @typedef {z.infer<typeof serviceRecordSchema>} ServiceRecordInput */
