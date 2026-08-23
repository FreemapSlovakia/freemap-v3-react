import { openTool } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { requestCompassPermission } from '@features/location/compass.js';
import { panoramaPick } from '@features/panorama/model/actions.js';
import { placeToposcopeCenter } from '@features/toposcope/centerPoint.js';
import { OnlineOnlyItem } from '@shared/components/OnlineOnlyItem.js';
import type { LatLon } from '@shared/types/common.js';
import type { ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import { PiCompassRoseBold, PiMountains } from 'react-icons/pi';
import { useDispatch, useStore } from 'react-redux';

type Props = LatLon & {
  /** Run after either — a modal over the map closes itself here. */
  onAct?: () => void;
  /** A leading divider, rendered only where the items themselves are. */
  divider?: boolean;
};

/**
 * The two views taken from a place — a panorama rendered there, a toposcope
 * standing there. Dropdown items, so any menu that knows a position can carry
 * them.
 */
export function ViewFromHereItems({
  lat,
  lon,
  onAct,
  divider,
}: Props): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  // Read as the click comes: the centre is placed against the whole drawing,
  // which is nothing a menu should re-render for.
  const store = useStore<RootState>();

  // An embed opens no tools, so the items would answer with nothing.
  if (window.fmEmbedded) {
    return null;
  }

  return (
    <>
      {divider && <Dropdown.Divider />}

      <OnlineOnlyItem
        as="button"
        onClick={() => {
          // iOS hands out the magnetometer only from a gesture, and the view
          // follows it as soon as it is up.
          void requestCompassPermission();

          dispatch(openTool('panorama'));

          dispatch(panoramaPick({ lat, lon }));

          onAct?.();
        }}
      >
        <PiMountains /> {m?.general.panoramaFromHere}
      </OnlineOnlyItem>

      <Dropdown.Item
        as="button"
        onClick={() => {
          dispatch(openTool('toposcope'));

          dispatch(placeToposcopeCenter(store.getState(), { lat, lon }));

          onAct?.();
        }}
      >
        <PiCompassRoseBold /> {m?.general.toposcopeFromHere}
      </Dropdown.Item>
    </>
  );
}
