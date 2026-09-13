import { z } from 'zod';

export const vehicleSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  variant: z.string().optional(),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  purchasePrice: z.coerce.number().min(0).optional(),
  odometer: z.coerce.number().min(0).optional(),
  fuelType: z.enum(['petrol', 'diesel', 'cng', 'electric']),
});

/** @typedef {z.infer<typeof vehicleSchema>} VehicleInput */
