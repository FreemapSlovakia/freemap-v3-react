import z from 'zod';

export const CODE_PATTERN = /^\d{6}$/;

/** Leaves the digits of a pasted or typed code. */
export function cleanCode(value: string): string {
  return value.replace(/\D/g, '').slice(0, 6);
}

// As the API validates it, so the form never offers what it refuses.
const EmailSchema = z.email().max(255);

export function isValidEmail(value: string): boolean {
  return EmailSchema.safeParse(value).success;
}
