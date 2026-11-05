import {
  type ExternalTarget,
  type OsmObjectLinks,
  openInExternalApp,
} from '@app/store/actions.js';
import { OpenInExternalTargetItems } from '@features/openInExternalApp/components/OpenInExternalAppMenuItems.js';
import { useSelectionOpener } from '@features/openInExternalApp/selectionOpener.js';
import { useOpenInExternalAppMessages } from '@features/openInExternalApp/translations/useOpenInExternalAppMessages.js';
import type { SelectCallback } from '@restart/ui/types';
import { LocationActionItems } from '@shared/components/LocationActionItems.js';
import {
  ActionDivider,
  ActionItems,
  ActionSubmenu,
} from '@shared/components/ResponsiveActions.js';
import type { ViewFromHere } from '@shared/components/ViewFromHereItems.js';
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
  /** See `OpenInExternalTargetItems`. */
  osmObject?: OsmObjectLinks;
  /** The place is the selection's, so the `j` chords open it. */
  selection?: boolean;
};

/**
 * What can be done with a place on the map: everything the map's own context
 * menu offers, flat, and the other maps behind a submenu. `actions` spreads
 * into a toolbar's `ResponsiveActions`; a docked panel takes `placeActions` and
 * `openInItems` for a menu each (`OpenInMenu`). `onSelect` answers the
 * external-app items' `eventKey`s, so it goes on every menu holding them.
 */
export function usePlaceActions({
  at,
  omit,
  onAct,
  osmObject,
  selection,
}: Props): {
  actions: ReactNode[];
  placeActions: ReactNode[];
  openInItems: ReactNode;
  onSelect: SelectCallback;
} {
  const oeam = useOpenInExternalAppMessages();

  const dispatch = useDispatch();

  const zoom = useAppSelector((state) => state.map.zoom);

  const open = (where: ExternalTarget) => {
    if (!at) {
      return;
    }

    dispatch(
      openInExternalApp({
        where,
        ...at,
        zoom,
        includePoint: true,
        osmObject,
      }),
    );

    onAct?.();
  };

  useSelectionOpener(selection && at ? open : null);

  // An embed opens neither tools nor other maps, so both groups would answer
  // with nothing and leave the menu holding dividers.
  const offered = at && !window.fmEmbedded;

  const placeActions: ReactNode[] = offered
    ? [
        <ActionItems key="location">
          <LocationActionItems {...at} omit={omit} onAct={onAct} />
        </ActionItems>,
      ]
    : [];

  const openInItems = offered ? (
    <OpenInExternalTargetItems
      {...at}
      zoom={zoom}
      includePoint
      osmObject={osmObject}
      showKbdShortcut={selection}
    />
  ) : null;

  return {
    actions: offered
      ? [
          ...placeActions,

          <ActionDivider key="open-in-divider" />,

          <ActionSubmenu
            key="open-in"
            label={oeam?.openIn}
            icon={<FaExternalLinkAlt />}
          >
            {openInItems}
          </ActionSubmenu>,
        ]
      : [],

    placeActions,

    openInItems,

    onSelect: (eventKey) => {
      const where =
        eventKey === null
          ? undefined
          : afterPrefix(eventKey as EventKey, 'open-');

      if (where !== undefined) {
        open(where);
      }
    },
  };
}
