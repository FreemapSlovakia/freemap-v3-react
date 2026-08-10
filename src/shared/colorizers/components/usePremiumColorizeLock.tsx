import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { isPremium } from '@features/premium/premium.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactNode } from 'react';
import type { ColorizingMode } from '../index.js';
import { isPremiumColorizingMode } from '../premiumColorize.js';

/**
 * Premium marks for one "Colorize by" dropdown option: premium modes carry a
 * gem for everyone and are locked for users without premium access, the gem
 * staying clickable there to start the purchase flow.
 */
export function usePremiumColorizeLock(): (
  mode: ColorizingMode | undefined,
) => {
  locked: boolean;
  gem: ReactNode;
} {
  const premium = useAppSelector((state) => isPremium(state.auth.user));

  return (mode) =>
    mode && isPremiumColorizingMode(mode)
      ? {
          locked: !premium,
          gem: <PremiumGem className="ms-1" capture nested />,
        }
      : { locked: false, gem: undefined };
}
