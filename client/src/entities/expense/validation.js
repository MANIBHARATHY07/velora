import { z } from 'zod';

export const expenseSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  description: z.string().optional(),
});

/** @typedef {z.infer<typeof expenseSchema>} ExpenseInput */
