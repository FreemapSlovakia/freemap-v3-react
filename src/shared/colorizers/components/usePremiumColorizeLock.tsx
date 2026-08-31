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
 *
 * `unlocked` widens who may pick one — it never narrows it, so a caller passing
 * a purely feature-specific flag cannot lock a premium subscriber out. It is for
 * a feature that grants the modes by another route, as the planned route does
 * for one shared by a premium user. The gem stays either way: it says the mode
 * is premium, which is the whole point of a reader seeing it work on someone
 * else's route.
 */
export function usePremiumColorizeLock(unlocked?: boolean): (
  mode: ColorizingMode | undefined,
) => {
  locked: boolean;
  gem: ReactNode;
} {
  const premium = useAppSelector((state) => isPremium(state.auth.user));

  return (mode) =>
    mode && isPremiumColorizingMode(mode)
      ? {
          locked: !(premium || unlocked),
          gem: <PremiumGem capture nested quiet />,
        }
      : { locked: false, gem: undefined };
}
