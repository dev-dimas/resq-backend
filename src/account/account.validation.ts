import { ZodType, z } from 'zod';

export class AccountValidation {
  static readonly REGISTER: ZodType = z.object({
    email: z.string().email(),
    name: z.string().min(1),
    password: z.string().min(8),
    asCustomer: z.boolean(),
  });

  static readonly LOGIN: ZodType = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  static readonly EDIT_PROFILE: ZodType = z.object({
    email: z.string().email(),
    name: z.string().min(1),
  });

  static readonly UPDATE_NOTIFICATION_TOKEN: ZodType = z.object({
    token: z.string().nullable(),
  });

  static readonly CHANGE_PASSWORD: ZodType = z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
  });

  static readonly UPDATE_LOCATION: ZodType = z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().min(1),
  });

  static readonly LOGOUT: ZodType = z.object({
    token: z.string().min(1),
  });
}
