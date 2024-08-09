import { ZodType, z } from 'zod';

export class AdminValidation {
  static readonly BAN_SELLER: ZodType = z.object({
    id: z.string(),
  });
}
