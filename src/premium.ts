import { User } from './types/auth.js';

export function isPremium(
  user: Pick<User, 'premiumExpiration'> | null,
): boolean {
  return user?.premiumExpiration != null && user.premiumExpiration > new Date();
}
