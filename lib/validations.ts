import { z } from 'zod';

export const invitationCodeSchema = z.object({
  code: z
    .string()
    .min(1, 'Invitation code is required')
    .trim()
    .toUpperCase(),
});

export const rsvpFormSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1, 'Full name is required').max(200),
  phone: z.string().min(1, 'Phone number is required').max(50),
  attending: z.boolean(),
  guestsCount: z.number().int().min(1).nullable(),
}).refine(
  (data) => {
    // If attending, guestsCount must be provided and >= 1
    if (data.attending && (!data.guestsCount || data.guestsCount < 1)) {
      return false;
    }
    return true;
  },
  {
    message: 'Please specify number of guests (minimum 1)',
    path: ['guestsCount'],
  }
);

export const adminLoginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export type InvitationCodeInput = z.infer<typeof invitationCodeSchema>;
export type RSVPFormInput = z.infer<typeof rsvpFormSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
