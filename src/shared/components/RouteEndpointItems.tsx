import { openTool } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  routePlannerSetFinish,
  routePlannerSetStart,
} from '@features/routePlanner/model/actions.js';
import { OnlineOnlyItem } from '@shared/components/OnlineOnlyItem.js';
import type { LatLon } from '@shared/types/common.js';
import type { ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaPlay, FaStop } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

type Props = LatLon & {
  /** Run after either — a modal over the map closes itself here. */
  onAct?: () => void;
  /** A leading divider, rendered only where the items themselves are. */
  divider?: boolean;
};

/**
 * A place as one end of a route. Dropdown items, so any menu that knows a
 * position can carry them.
 */
export function RouteEndpointItems({
  lat,
  lon,
  onAct,
  divider,
}: Props): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  // An embed opens no tools, so the item would answer with nothing.
  if (window.fmEmbedded) {
    return null;
  }

  return (
    <>
      {divider && <Dropdown.Divider />}

      <OnlineOnlyItem
        as="button"
        onClick={() => {
          dispatch(openTool('route-planner'));

          dispatch(routePlannerSetStart({ lat, lon }));

          onAct?.();
        }}
      >
        <FaPlay color="#32CD32" /> {m?.search.routeFrom}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        as="button"
        onClick={() => {
          dispatch(openTool('route-planner'));

          dispatch(routePlannerSetFinish({ lat, lon }));

          onAct?.();
        }}
      >
        <FaStop color="#FF6347" /> {m?.search.routeTo}
      </OnlineOnlyItem>
    </>
  );
}
