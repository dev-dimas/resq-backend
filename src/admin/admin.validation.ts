import { ZodType, z } from 'zod';

export class AdminValidation {
  static readonly BAN_ACCOUNT: ZodType = z.object({
    accountId: z.string(),
  });
  static readonly UNBAN_ACCOUNT: ZodType = z.object({
    accountId: z.string(),
  });
}
