import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { UserProfileMessages } from './UserProfileMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "user-profile-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useUserProfileMessages(): UserProfileMessages | undefined {
  return useLocalMessages<UserProfileMessages>(factory);
}
