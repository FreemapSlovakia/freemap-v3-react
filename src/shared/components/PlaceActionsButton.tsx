import { useMessages } from '@features/l10n/l10nInjector.js';
import { ResponsiveActions } from '@shared/components/ResponsiveActions.js';
import type { ViewFromHere } from '@shared/components/ViewFromHereItems.js';
import { usePlaceActions } from '@shared/hooks/usePlaceActions.js';
import type { LatLon } from '@shared/types/common.js';
import { Children, type ReactElement, type ReactNode } from 'react';
import type { ButtonProps } from 'react-bootstrap';
import { ActionDivider } from './ResponsiveActions.js';

type Props = LatLon & {
  /** Views this place is already the subject of; see `ViewFromHereItems`. */
  omit?: readonly ViewFromHere[];
  onAct?: () => void;
  size?: ButtonProps['size'];
  variant?: string;
  className?: string;
  /**
   * The caller's own `Action`s, which lead — what only this panel can do with
   * the place comes before what any menu can.
   */
  children?: ReactNode;
};

/**
 * The ⋮ menu of what can be done with a place — everything the map's own
 * context menu offers, for a place a panel already knows.
 */
export function PlaceActionsButton({
  size,
  variant,
  className,
  children,
  lat,
  lon,
  ...props
}: Props): ReactElement | null {
  const m = useMessages();

  const { actions, onSelect } = usePlaceActions({ at: { lat, lon }, ...props });

  const own = Children.count(children) > 0;

  return actions.length === 0 && !own ? null : (
    <ResponsiveActions
      size={size}
      variant={variant}
      className={className}
      toggleLabel={m?.general.placeActions}
      onSelect={onSelect}
    >
      {children}

      {own && actions.length > 0 && <ActionDivider />}

      {actions}
    </ResponsiveActions>
  );
}
