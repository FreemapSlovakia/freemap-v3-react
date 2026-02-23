import { type ReactElement, useCallback, useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { FaMinus, FaPlus, FaRegDotCircle } from 'react-icons/fa';
import { RiFullscreenExitLine, RiFullscreenLine } from 'react-icons/ri';
import { useDispatch } from 'react-redux';
import { toggleLocate } from '../actions/mainActions.js';
import { mapRefocus, MapViewState } from '../features/map/model/actions.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useMap } from '../hooks/useMap.js';
import { useMessages } from '../l10nInjector.js';
import { LongPressTooltip } from './LongPressTooltip.js';
import { MapSwitchButton } from './MapSwitchButton.js';
import { Toolbar } from './Toolbar.js';

export function MapControls(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const zoom = useAppSelector((state) => state.map.zoom);

  const embedFeatures = useAppSelector((state) => state.main.embedFeatures);

  const locate = useAppSelector((state) => state.main.locate);

  const gpsTracked = useAppSelector((state) => state.map.gpsTracked);

  const onMapRefocus = useCallback(
    (changes: Partial<MapViewState>) => {
      dispatch(mapRefocus(changes));
    },
    [dispatch],
  );

  const map = useMap();

  const handleFullscreenClick = useCallback(() => {
    if (!document.exitFullscreen) {
      // unsupported
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen();
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
  }, [forceUpdate, setForceUpdate]);

  return !map ? null : (
    <Toolbar className="mx-2 mb-2">
      {(!window.fmEmbedded || !embedFeatures.includes('noMapSwitch')) && (
        <MapSwitchButton />
      )}

      <ButtonGroup className="ms-1">
        <LongPressTooltip label={m?.main.zoomIn}>
          {({ props }) => (
            <Button
              variant="secondary"
              onClick={() => {
                onMapRefocus({ zoom: zoom + 1 });
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
                onMapRefocus({ zoom: zoom - 1 });
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
              className="ms-1"
              onClick={() => {
                dispatch(toggleLocate(undefined));
              }}
              active={locate}
              variant={gpsTracked ? 'warning' : 'secondary'}
              {...props}
            >
              <FaRegDotCircle />
            </Button>
          )}
        </LongPressTooltip>
      )}

      {'exitFullscreen' in document && (
        <LongPressTooltip
          label={
            document.fullscreenElement
              ? m?.general.exitFullscreen
              : m?.general.fullscreen
          }
        >
          {({ props }) => (
            <Button
              className="ms-1"
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
    </Toolbar>
  );
}
