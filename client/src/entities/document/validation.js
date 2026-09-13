import { z } from 'zod';

export const DOCUMENT_TYPES = ['insurance', 'rc', 'puc', 'warranty', 'sot', 'loan', 'invoice', 'quotation'];

export const documentSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  type: z.enum(DOCUMENT_TYPES),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
  extractedText: z.string().optional(),
});

/** @typedef {z.infer<typeof documentSchema>} DocumentInput */
