import { type ReactElement, useCallback, useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { FaMinus, FaPlus, FaRegDotCircle } from 'react-icons/fa';
import { RiFullscreenExitLine, RiFullscreenLine } from 'react-icons/ri';
import { useDispatch } from 'react-redux';
import { toggleLocate } from '../actions/mainActions.js';
import { mapRefocus, MapViewState } from '../actions/mapActions.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useMap } from '../hooks/useMap.js';
import { useMessages } from '../l10nInjector.js';
import { MapSwitchButton } from './MapSwitchButton.js';

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
    <div className="card fm-toolbar mx-2 mb-2">
      {(!window.fmEmbedded || !embedFeatures.includes('noMapSwitch')) && (
        <MapSwitchButton />
      )}

      <ButtonGroup className="ms-1">
        <Button
          variant="secondary"
          onClick={() => {
            onMapRefocus({ zoom: zoom + 1 });
          }}
          title={m?.main.zoomIn}
          disabled={zoom >= map.getMaxZoom()}
        >
          <FaPlus />
        </Button>

        <Button
          variant="secondary"
          onClick={() => {
            onMapRefocus({ zoom: zoom - 1 });
          }}
          title={m?.main.zoomOut}
          disabled={zoom <= map.getMinZoom()}
        >
          <FaMinus />
        </Button>
      </ButtonGroup>

      {(!window.fmEmbedded || !embedFeatures.includes('noLocateMe')) && (
        <Button
          className="ms-1"
          onClick={() => {
            dispatch(toggleLocate(undefined));
          }}
          title={m?.main.locateMe}
          active={locate}
          variant={gpsTracked ? 'warning' : 'secondary'}
        >
          <FaRegDotCircle />
        </Button>
      )}

      {'exitFullscreen' in document && (
        <Button
          className="ms-1"
          variant="secondary"
          onClick={handleFullscreenClick}
          title={
            document.fullscreenElement
              ? m?.general.exitFullscreen
              : m?.general.fullscreen
          }
        >
          {document.fullscreenElement ? (
            <RiFullscreenExitLine />
          ) : (
            <RiFullscreenLine />
          )}
        </Button>
      )}
    </div>
  );
}
