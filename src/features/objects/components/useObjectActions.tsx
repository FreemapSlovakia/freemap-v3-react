import { openInExternalApp } from '@app/store/actions.js';
import {
  OpenInExternalTargetItems,
  SharePageItems,
} from '@features/openInExternalApp/components/OpenInExternalAppMenuItems.js';
import {
  getIdElementUrl,
  getOsmElementUrl,
} from '@features/openInExternalApp/externalUrlUtils.js';
import { josmRemote } from '@features/openInExternalApp/josmRemote.js';
import { useOpenInExternalAppMessages } from '@features/openInExternalApp/translations/useOpenInExternalAppMessages.js';
import type { SearchResult } from '@features/search/model/actions.js';
import { resultCoords } from '@features/search/model/resultUtils.js';
import {
  getGenericNameFromOsmElement,
  getNameFromOsmElement,
} from '@osm/osmNameResolver.js';
import type { SelectCallback } from '@restart/ui/types';
import { OnlineOnlyItem } from '@shared/components/OnlineOnlyItem.js';
import {
  ActionDivider,
  ActionItems,
  ActionSubmenu,
} from '@shared/components/ResponsiveActions.js';
import { RouteEndpointItems } from '@shared/components/RouteEndpointItems.js';
import { ViewFromHereItems } from '@shared/components/ViewFromHereItems.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEffectiveChosenLanguage } from '@shared/hooks/useEffectiveChosenLanguage.js';
import type { EventKey } from '@shared/hooks/useMenuHandler.js';
import {
  type OsmFeatureId,
  OsmFeatureIdSchema,
} from '@shared/types/featureId.js';
import { afterPrefix } from '@shared/types/typeUtils.js';
import { type ReactNode, useMemo } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useObjectsMessages } from '../translations/useObjectsMessages.js';

type Props = {
  /** The selected feature, or `null` where nothing is selected. */
  result: SearchResult | null;
};

/**
 * What can be done with a selected OSM feature: routed to, looked at from, and
 * opened elsewhere — its page on osm.org, JOSM, the other maps.
 *
 * The actions come back as a list to spread into the toolbar's own
 * `ResponsiveActions`, so both toolbars that can carry them share one ⋮ menu
 * instead of growing a second. `onSelect` belongs on that same component — the
 * external-app items act through their `eventKey`.
 */
export function useObjectActions({ result }: Props): {
  actions: ReactNode[];
  onSelect: SelectCallback;
} {
  const om = useObjectsMessages();

  const oeam = useOpenInExternalAppMessages();

  const dispatch = useDispatch();

  const zoom = useAppSelector((state) => state.map.zoom);

  const language = useAppSelector((state) => state.l10n.language);

  const tagLanguage = useEffectiveChosenLanguage();

  const displayName = !result
    ? undefined
    : result.displayName ||
      getNameFromOsmElement(result.geojson.properties ?? {}, language);

  const parsedId = result ? OsmFeatureIdSchema.safeParse(result.id) : null;

  // Walking the geometry of a whole boundary relation is not something to do on
  // every zoom step.
  const coords = useMemo(
    () => (result ? resultCoords(result) : null),
    [result],
  );

  // The kind of thing it is names the layer, and is resolved on the click: an
  // objects refresh replaces the result on every pan, so resolving it with the
  // selection would reload the tag mapping that often for a menu never opened.
  const editInJosm = (element: OsmFeatureId) => {
    (result?.genericName
      ? Promise.resolve(result.genericName)
      : getGenericNameFromOsmElement(
          result?.geojson.properties ?? {},
          element.elementType,
          tagLanguage,
        )
    )
      .catch(() => undefined)
      .then((genericName) => {
        josmRemote(dispatch, 'load_object', {
          new_layer: 'true',
          relation_members: 'true',
          objects:
            { node: 'n', way: 'w', relation: 'r' }[element.elementType] +
            element.id,
          layer_name:
            [genericName, displayName && `"${displayName}"`]
              .filter(Boolean)
              .join(' ') || 'Freemap',
        });
      });
  };

  // The element's own entries, which the "Open in…" section carries above the
  // targets that only know the position.
  const osmItems = !parsedId?.success ? null : (
    <>
      <OnlineOnlyItem
        href={getOsmElementUrl(parsedId.data)}
        target="_blank"
        eventKey="url"
      >
        {om?.openInOsm}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getOsmElementUrl(parsedId.data, true)}
        target="_blank"
        eventKey="url"
      >
        {om?.osmHistory}
      </OnlineOnlyItem>

      {!window.fmEmbedded && (
        <>
          <Dropdown.Item as="button" onClick={() => editInJosm(parsedId.data)}>
            {oeam?.josm}
          </Dropdown.Item>

          <OnlineOnlyItem
            href={getIdElementUrl(parsedId.data)}
            target="_blank"
            eventKey="url"
          >
            {oeam?.id}
          </OnlineOnlyItem>
        </>
      )}
    </>
  );

  const openIn = (items: ReactNode) => (
    <ActionSubmenu
      key="open-in"
      label={oeam?.openIn}
      icon={<FaExternalLinkAlt />}
    >
      {items}
    </ActionSubmenu>
  );

  const actions: ReactNode[] = [];

  if (coords && !window.fmEmbedded) {
    actions.push(
      <ActionDivider key="route-divider" />,

      <ActionItems key="route">
        <RouteEndpointItems {...coords} />
      </ActionItems>,

      <ActionDivider key="view-divider" />,

      <ActionItems key="views">
        <ViewFromHereItems {...coords} />
      </ActionItems>,

      <ActionDivider key="share-divider" />,

      <ActionItems key="share">
        <SharePageItems />
      </ActionItems>,

      openIn(
        <OpenInExternalTargetItems
          lat={coords.lat}
          lon={coords.lon}
          zoom={zoom}
          includePoint
          // The editors here open the element itself; the list's own open
          // whatever is at the position, which is not the same thing.
          editors={false}
        >
          {osmItems}
        </OpenInExternalTargetItems>,
      ),
    );
  } else if (osmItems) {
    // No place to act at — a hit that came without geometry — so the element's
    // own entries are all the section holds.
    actions.push(<ActionDivider key="osm-divider" />, openIn(osmItems));
  }

  return {
    actions,

    onSelect: (eventKey) => {
      const where =
        eventKey === null
          ? undefined
          : afterPrefix(eventKey as EventKey, 'open-');

      if (where !== undefined && coords) {
        dispatch(
          openInExternalApp({
            where,
            ...coords,
            zoom,
            includePoint: true,
            pointTitle: displayName,
          }),
        );
      }
    },
  };
}
