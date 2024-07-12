import { ZodType, z } from 'zod';

export class ProductValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string().min(3),
    description: z.string().min(1),
    price: z.string(),
    categoryName: z
      .string()
      .refine((val) => /^(Makanan|Minuman|Salad|Desert)$/.test(val), {
        message:
          "Invalid category name. Expected 'Makanan', 'Minuman', 'Salad', or 'Desert'.",
      }),
    images: z.any(),
    startTime: z
      .string()
      .refine((val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), {
        message: 'Invalid time format. Expected HH:mm.',
      }),
    endTime: z
      .string()
      .refine((val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), {
        message: 'Invalid time format. Expected HH:mm.',
      }),
    isDaily: z.string().refine((val) => val === 'true' || val === 'false', {
      message: 'Invalid value. Expected true or false.',
    }),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z.string().min(3).optional(),
    description: z.string().min(1).optional(),
    price: z.string().optional(),
    categoryName: z
      .string()
      .refine((val) => /^(Makanan|Minuman|Salad|Desert)$/.test(val), {
        message:
          "Invalid category name. Expected 'Makanan', 'Minuman', 'Salad', or 'Desert'.",
      })
      .optional(),
    images: z.any().optional(),
    startTime: z
      .string()
      .refine((val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), {
        message: "Invalid time format. Expected 'HH:mm'.",
      })
      .optional(),
    endTime: z
      .string()
      .refine((val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), {
        message: "Invalid time format. Expected 'HH:mm'.",
      })
      .optional(),
    isDaily: z
      .string()
      .refine((val) => val === 'true' || val === 'false', {
        message: "Invalid value. Expected 'true' or 'false'.",
      })
      .optional(),
    isActive: z
      .string()
      .refine((val) => /^(true|false)$/.test(val), {
        message: "Invalid value. Expected 'true' or 'false'.",
      })
      .optional(),
  });

  static readonly FIND: ZodType = z.object({
    keyword: z.string().min(3),
  });
}
