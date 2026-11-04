import type { Role } from '../model/types.js';
import type { AuthMessages } from './AuthMessages.js';

/** The roles with their names, in the language's order of those names. */
export function namedRoles(
  roles: Role[],
  am: AuthMessages | undefined,
  language: string,
) {
  return roles
    .map((role) => ({ role, name: am?.roleNames[role] ?? role }))
    .toSorted((a, b) => a.name.localeCompare(b.name, language));
}
