import { ZodType, z } from 'zod';

export class CustomerValidation {
  static readonly SUBSCRIBE: ZodType = z.object({
    to: z.string(),
  });

  static readonly UNSUBSCRIBE: ZodType = z.object({
    from: z.string(),
  });

  static readonly FAVORITE: ZodType = z.object({
    productId: z.string(),
  });

  static readonly UNFAVORITE: ZodType = z.object({
    productId: z.string(),
  });
}
