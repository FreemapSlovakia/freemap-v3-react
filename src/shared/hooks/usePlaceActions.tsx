import { openInExternalApp } from '@app/store/actions.js';
import { OpenInExternalTargetItems } from '@features/openInExternalApp/components/OpenInExternalAppMenuItems.js';
import { useOpenInExternalAppMessages } from '@features/openInExternalApp/translations/useOpenInExternalAppMessages.js';
import type { SelectCallback } from '@restart/ui/types';
import {
  ActionDivider,
  ActionItems,
  ActionSubmenu,
} from '@shared/components/ResponsiveActions.js';
import { RouteEndpointItems } from '@shared/components/RouteEndpointItems.js';
import {
  type ViewFromHere,
  ViewFromHereItems,
} from '@shared/components/ViewFromHereItems.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { EventKey } from '@shared/hooks/useMenuHandler.js';
import type { LatLon } from '@shared/types/common.js';
import { afterPrefix } from '@shared/types/typeUtils.js';
import type { ReactNode } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

type Props = {
  /** The place, or `null` where the panel has none yet — then nothing is offered. */
  at: LatLon | null;
  /**
   * Views this place is already the subject of — the panorama's own viewpoint
   * offers no panorama from here, since it is the one on screen.
   */
  omit?: readonly ViewFromHere[];
  /** Run after any of them — a panel over the map closes itself here. */
  onAct?: () => void;
};

/**
 * What can be done with a place on the map: routed from or to, looked at from,
 * opened elsewhere. Spread into a toolbar's `ResponsiveActions`, whose
 * `onSelect` this also answers — the external-app items act through their
 * `eventKey`.
 */
export function usePlaceActions({ at, omit, onAct }: Props): {
  actions: ReactNode[];
  onSelect: SelectCallback;
} {
  const oeam = useOpenInExternalAppMessages();

  const dispatch = useDispatch();

  const zoom = useAppSelector((state) => state.map.zoom);

  const actions: ReactNode[] = [];

  // An embed opens neither tools nor other maps, so both groups would answer
  // with nothing and leave the menu holding dividers.
  if (at && !window.fmEmbedded) {
    actions.push(
      <ActionItems key="route">
        <RouteEndpointItems {...at} onAct={onAct} />
      </ActionItems>,

      <ActionDivider key="view-divider" />,

      <ActionItems key="views">
        <ViewFromHereItems {...at} omit={omit} onAct={onAct} />
      </ActionItems>,

      <ActionDivider key="open-divider" />,

      <ActionSubmenu
        key="open-in"
        label={oeam?.openIn}
        icon={<FaExternalLinkAlt />}
      >
        <OpenInExternalTargetItems {...at} zoom={zoom} includePoint />
      </ActionSubmenu>,
    );
  }

  return {
    actions,

    onSelect: (eventKey) => {
      const where =
        eventKey === null
          ? undefined
          : afterPrefix(eventKey as EventKey, 'open-');

      if (where !== undefined && at) {
        dispatch(openInExternalApp({ where, ...at, zoom, includePoint: true }));

        onAct?.();
      }
    },
  };
}
