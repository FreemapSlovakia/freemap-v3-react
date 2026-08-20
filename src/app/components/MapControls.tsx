import { useMessages } from '@features/l10n/l10nInjector.js';
import { ensureCompassPermission } from '@features/location/ensureCompassPermission.js';
import { useMap } from '@features/map/hooks/useMap.js';
import { type MapViewState, mapRefocus } from '@features/map/model/actions.js';
import { steppedZoom } from '@features/map/zoomStep.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useCallback, useEffect, useState } from 'react';
import { Button, ButtonGroup, Spinner } from 'react-bootstrap';
import { FaMinus, FaPlus, FaRegDotCircle } from 'react-icons/fa';
import { RiFullscreenExitLine, RiFullscreenLine } from 'react-icons/ri';
import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { toggleLocate } from '../store/actions.js';
import { MapManageButton } from './MapManageButton.js';
import { MapSwitchButton } from './MapSwitchButton.js';

export function MapControls(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const zoom = useAppSelector((state) => state.map.zoom);

  const embedFeatures = useAppSelector((state) => state.main.embedFeatures);

  const locate = useAppSelector((state) => state.location.locate);

  const locating = useAppSelector((state) => state.location.locating);

  const gpsTracked = useAppSelector((state) => state.map.gpsTracked);

  const headingSource = useAppSelector(
    (state) => state.locationSettings.headingSource,
  );

  const location = useAppSelector((state) => state.location.location);

  // while picking a photo position or drawing a map-area rectangle, the map
  // switcher is restricted to plain layer switching — managing maps is out of
  // the way of the pick
  const restrictToMapSwitching = useAppSelector(
    (state) =>
      state.gallery.pickingPositionForId !== null ||
      state.mapArea.selecting !== null,
  );

  const handleLocateClick = useCallback(() => {
    // Locating on but not following — the user panned away from the position.
    // Pressing the button then means "take me back", not "stop locating"; only
    // a press while following turns locating off.
    if (locate && !gpsTracked) {
      dispatch(
        mapRefocus(
          location
            ? { lat: location.lat, lon: location.lon, gpsTracked: true }
            : { gpsTracked: true },
        ),
      );

      return;
    }

    // iOS forgets the orientation grant between page loads while the preference
    // survives, so a stored compass choice needs a gesture to revive it; this is
    // the earliest one that means "I want to be located".
    if (!locate && headingSource === 'compass') {
      ensureCompassPermission(dispatch);
    }

    dispatch(toggleLocate(undefined));
  }, [dispatch, gpsTracked, headingSource, locate, location]);

  const onMapRefocus = useCallback(
    (changes: Partial<MapViewState>) => {
      dispatch(mapRefocus(changes));
    },
    [dispatch],
  );

  // An installed app has no browser chrome to escape, so the button would win
  // nothing. Deliberately not `(display-mode: fullscreen)` as well: that also
  // matches while the Fullscreen API is active, which would take the button
  // away at the moment it is needed to leave again.
  const installed = useMediaQuery({ query: '(display-mode: standalone)' });

  const map = useMap();

  const handleFullscreenClick = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      try {
        // Some WebViews advertise the API but reject (or throw synchronously)
        // with "Fullscreen is not supported"; swallow both.
        document.body.requestFullscreen().catch(() => {});
      } catch {
        // ignore
      }
    }
  }, []);

  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    function handler() {
      setForceUpdate(forceUpdate + 1);
    }

    document.addEventListener('fullscreenchange', handler);

    return () => {
      document.removeEventListener('fullscreenchange', handler);
    };
  }, [forceUpdate]);

  return !map ? null : (
    <Toolbar className="m-2">
      {(!window.fmEmbedded || !embedFeatures.includes('noMapSwitch')) && (
        <MapSwitchButton />
      )}

      <ButtonGroup>
        <LongPressTooltip label={m?.main.zoomIn}>
          {({ props }) => (
            <Button
              variant="secondary"
              onClick={() => {
                onMapRefocus({ zoom: steppedZoom(zoom, 1) });
              }}
              disabled={zoom >= map.getMaxZoom()}
              {...props}
            >
              <FaPlus />
            </Button>
          )}
        </LongPressTooltip>

        <LongPressTooltip label={m?.main.zoomOut}>
          {({ props }) => (
            <Button
              variant="secondary"
              onClick={() => {
                onMapRefocus({ zoom: steppedZoom(zoom, -1) });
              }}
              disabled={zoom <= map.getMinZoom()}
              {...props}
            >
              <FaMinus />
            </Button>
          )}
        </LongPressTooltip>
      </ButtonGroup>

      {(!window.fmEmbedded || !embedFeatures.includes('noLocateMe')) && (
        <LongPressTooltip label={m?.main.locateMe}>
          {({ props }) => (
            <Button
              onClick={handleLocateClick}
              active={locate}
              variant={gpsTracked ? 'warning' : 'secondary'}
              {...props}
            >
              {locating ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <FaRegDotCircle />
              )}
            </Button>
          )}
        </LongPressTooltip>
      )}

      {document.fullscreenEnabled && !installed && (
        <LongPressTooltip
          label={
            document.fullscreenElement
              ? m?.general.exitFullscreen
              : m?.general.fullscreen
          }
        >
          {({ props }) => (
            <Button
              variant="secondary"
              onClick={handleFullscreenClick}
              {...props}
            >
              {document.fullscreenElement ? (
                <RiFullscreenExitLine />
              ) : (
                <RiFullscreenLine />
              )}
            </Button>
          )}
        </LongPressTooltip>
      )}

      {/* Last, being the one button that leads away from the map rather than
          acting on it. One flag with the switcher: an embed that may not switch
          maps has no use for the editors and caches that manage them either. */}
      {(!window.fmEmbedded || !embedFeatures.includes('noMapSwitch')) &&
        !restrictToMapSwitching && <MapManageButton />}
    </Toolbar>
  );
}
