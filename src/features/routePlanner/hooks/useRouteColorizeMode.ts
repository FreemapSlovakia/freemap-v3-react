import type { ColorizingMode } from '@shared/colorizers/index.js';
import { unlockedColorizingMode } from '@shared/colorizers/premiumColorize.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { routePremiumUnlockedSelector } from '../model/reducer.js';

/**
 * The planned route's colorize mode as it actually applies. Unlike the shared
 * hook, a premium mode also applies to a route shared by someone with premium —
 * see {@link routePremiumUnlockedSelector}.
 */
export function useRouteColorizeMode(): ColorizingMode | null {
  return unlockedColorizingMode(
    useAppSelector((state) => state.routePlannerSettings.colorizeBy),
    useAppSelector(routePremiumUnlockedSelector),
  );
}
