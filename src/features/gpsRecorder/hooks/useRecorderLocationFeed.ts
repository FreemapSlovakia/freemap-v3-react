import {
  locationSetExternalSource,
  setLocation,
} from '@features/location/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { selectLatestRecorderPoint } from '../model/selectors.js';

/**
 * Publishes the recorder's fixes as the app's own position, so the map's usual
 * marker — dot, accuracy circle, heading beam, fading as the fix ages — shows
 * the recording without the browser watching the GPS a second time.
 *
 * Only one source may run at a time. The browser's watch asks for continuous
 * high accuracy, which Android merges with the recorder's request at the higher
 * rate, so leaving it running would quietly cancel whatever the recording was
 * configured to save. Claiming the feed is what stops it; releasing it hands
 * back, and the browser's watch picks up by itself.
 *
 * Nothing here turns locating on or moves the map: pressing the locate button is
 * how the user asks for that, and starting a recording is not the same request.
 *
 * Belongs to the tool rather than to the map layer: fixes reach this page only
 * while the tool holds the stream open, so the claim should last exactly as long
 * as that does.
 */
export function useRecorderLocationFeed(): void {
  const dispatch = useDispatch();

  const feedLocation = useAppSelector(
    (state) => state.gpsRecorderSettings.feedLocation,
  );

  const recording = useAppSelector(
    (state) => state.gpsRecorder.status?.recording ?? false,
  );

  const locate = useAppSelector((state) => state.location.locate);

  const latest = useAppSelector(selectLatestRecorderPoint);

  // Claimed only once there is a fix to publish. Taking the source earlier
  // stops the browser's watch and leaves the marker on the last position it
  // reported until the recorder's first fix — which on a cold start is a while.
  const external = feedLocation && recording && latest !== null;

  useEffect(() => {
    if (!external) {
      return;
    }

    dispatch(locationSetExternalSource(true));

    return () => {
      dispatch(locationSetExternalSource(false));
    };
  }, [dispatch, external]);

  // Publishing only while the marker is wanted keeps the two in step: the marker
  // renders on the presence of a location, so feeding one with locate off would
  // leave a dot on the map with the button unlit.
  useEffect(() => {
    if (external && locate && latest) {
      dispatch(
        setLocation({
          lat: latest.lat,
          lon: latest.lon,
          // A fix that reported no accuracy gets no circle, rather than one
          // whose radius this app invented.
          accuracy: latest.acc ?? 0,
          heading: latest.brg,
          speed: latest.spd,
          at: latest.ts,
        }),
      );
    }
  }, [dispatch, external, locate, latest]);
}
