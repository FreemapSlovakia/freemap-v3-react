import { isPremium } from '@features/premium/premium.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ColorizingMode } from './index.js';

/** Modes free for everyone; every other mode needs premium access. */
const freeModes = new Set<ColorizingMode>(['elevation', 'speed', 'time']);

export function isPremiumColorizingMode(mode: ColorizingMode): boolean {
  return !freeModes.has(mode);
}

/**
 * The mode as it actually applies: `null` when it needs premium access the user
 * doesn't have, so a mode kept in persisted settings, restored from a saved map
 * or given in the URL stops colorizing once premium is gone.
 */
export function unlockedColorizingMode(
  mode: ColorizingMode | null | undefined,
  premium: boolean,
): ColorizingMode | null {
  return mode && (premium || !isPremiumColorizingMode(mode)) ? mode : null;
}

/** Hook form of `unlockedColorizingMode`, reading premium status from the store. */
export function useUnlockedColorizingMode(
  mode: ColorizingMode | null | undefined,
): ColorizingMode | null {
  const premium = useAppSelector((state) => isPremium(state.auth.user));

  return unlockedColorizingMode(mode, premium);
}
