import { openTool } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { requestCompassPermission } from '@features/location/compass.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import {
  panoramaLookAt,
  panoramaPick,
} from '@features/panorama/model/actions.js';
import { placeToposcopeCenter } from '@features/toposcope/centerPoint.js';
import { VIEWSHED_LAYER } from '@features/viewshed/api.js';
import { viewshedPick } from '@features/viewshed/model/actions.js';
import { OnlineOnlyItem } from '@shared/components/OnlineOnlyItem.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { LatLon } from '@shared/types/common.js';
import type { ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaBinoculars, FaCrosshairs } from 'react-icons/fa';
import { PiCompassRoseBold, PiMountains } from 'react-icons/pi';
import { useDispatch, useStore } from 'react-redux';

/** One of the views offered here; see {@link ViewFromHereItems}'s `omit`. */
export type ViewFromHere = 'panorama' | 'lookAt' | 'viewshed' | 'toposcope';

type Props = LatLon & {
  /** Run after either — a modal over the map closes itself here. */
  onAct?: () => void;
  /** A leading divider, rendered only where the items themselves are. */
  divider?: boolean;
  /** Views that would answer with what is already on screen. */
  omit?: readonly ViewFromHere[];
};

/**
 * The views taken from a place — a panorama rendered there, what can be seen
 * from there, a toposcope standing there — and, where a panorama is already up,
 * turning it to face this place. Dropdown items, so any menu that knows a
 * position can carry them.
 */
export function ViewFromHereItems({
  lat,
  lon,
  onAct,
  divider,
  omit,
}: Props): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  // Nothing to turn where no picture has been rendered — the tool may even be
  // closed, which keeps its picture.
  const hasPanorama = useAppSelector((state) => state.panorama.render !== null);

  // The dial's rays are the points already drawn, so with none it is an empty
  // dial; the toposcope's own ◎ button is the way in from nothing.
  const hasDrawnPoints = useAppSelector(
    (state) => state.drawingPoints.points.length > 0,
  );

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

      {!omit?.includes('panorama') && (
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
      )}

      {hasPanorama && !omit?.includes('lookAt') && (
        <Dropdown.Item
          as="button"
          onClick={() => {
            dispatch(openTool('panorama'));

            dispatch(panoramaLookAt({ lat, lon }));

            onAct?.();
          }}
        >
          <FaCrosshairs /> {m?.general.lookAtInPanorama}
        </Dropdown.Item>
      )}

      {!omit?.includes('viewshed') && (
        <OnlineOnlyItem
          as="button"
          onClick={() => {
            // Turning the layer on with no viewpoint asks for a click; the pick
            // that follows answers it before anything is drawn.
            dispatch(mapToggleLayer({ type: VIEWSHED_LAYER, enable: true }));

            dispatch(viewshedPick({ lat, lon }));

            onAct?.();
          }}
        >
          <FaBinoculars /> {m?.general.viewshedFromHere}
        </OnlineOnlyItem>
      )}

      {!omit?.includes('toposcope') && hasDrawnPoints && (
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
      )}
    </>
  );
}
