import { ZodType, z } from 'zod';

export class NotificationValidation {
  static readonly SEND: ZodType = z.object({
    to: z.array(z.string()),
    title: z.string(),
    body: z.string(),
    url: z.string().nullable(),
    pushKey: z.string(),
  });
}
