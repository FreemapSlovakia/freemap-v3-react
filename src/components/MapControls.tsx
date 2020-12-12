import { useCallback, useState, useEffect, ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ButtonGroup, Button, Card } from 'react-bootstrap';
import { MapSwitchButton } from './MapSwitchButton';
import { FontAwesomeIcon } from './FontAwesomeIcon';
import { RootState } from 'fm3/storeCreator';
import { useMessages } from 'fm3/l10nInjector';
import { MapViewState, mapRefocus } from 'fm3/actions/mapActions';
import { toggleLocate } from 'fm3/actions/mainActions';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';

export function MapControls(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const zoom = useSelector((state: RootState) => state.map.zoom);

  const embedFeatures = useSelector(
    (state: RootState) => state.main.embedFeatures,
  );

  const locate = useSelector((state: RootState) => state.main.locate);

  const gpsTracked = useSelector((state: RootState) => state.map.gpsTracked);

  const onMapRefocus = useCallback(
    (changes: Partial<MapViewState>) => {
      dispatch(mapRefocus(changes));
    },
    [dispatch],
  );

  const map = getMapLeafletElement();

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

  if (!map) {
    return null;
  }

  const embed = window.self !== window.top;

  return (
    <Card className="fm-toolbar">
      {(!embed || !embedFeatures.includes('noMapSwitch')) && (
        <MapSwitchButton />
      )}
      <ButtonGroup className="ml-1">
        <Button
          variant="secondary"
          onClick={() => {
            onMapRefocus({ zoom: zoom + 1 });
          }}
          title={m?.main.zoomIn}
          disabled={zoom >= map.getMaxZoom()}
        >
          <FontAwesomeIcon icon="plus" />
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            onMapRefocus({ zoom: zoom - 1 });
          }}
          title={m?.main.zoomOut}
          disabled={zoom <= map.getMinZoom()}
        >
          <FontAwesomeIcon icon="minus" />
        </Button>
      </ButtonGroup>
      {(!embed || !embedFeatures.includes('noLocateMe')) && (
        <Button
          className="ml-1"
          onClick={() => {
            dispatch(toggleLocate());
          }}
          title={m?.main.locateMe}
          active={locate}
          variant={gpsTracked ? 'warning' : 'secondary'}
        >
          <FontAwesomeIcon icon="dot-circle-o" />
        </Button>
      )}
      {'exitFullscreen' in document && (
        <Button
          className="ml-1"
          variant="secondary"
          onClick={handleFullscreenClick}
          title={
            document.fullscreenElement
              ? m?.general.exitFullscreen
              : m?.general.fullscreen
          }
        >
          <FontAwesomeIcon
            icon={document.fullscreenElement ? 'compress' : 'expand'}
          />
        </Button>
      )}
    </Card>
  );
}
