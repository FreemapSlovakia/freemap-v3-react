import { useMessages } from '@features/l10n/l10nInjector.js';
import { useMap } from '@features/map/hooks/useMap.js';
import { MapViewState, mapRefocus } from '@features/map/model/actions.js';
import { ActionIcon } from '@mantine/core';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useCallback, useEffect, useState } from 'react';
import { FaMinus, FaPlus, FaRegDotCircle } from 'react-icons/fa';
import { RiFullscreenExitLine, RiFullscreenLine } from 'react-icons/ri';
import { useDispatch } from 'react-redux';
import { toggleLocate } from '../store/actions.js';
import { MapSwitchButton } from './MapSwitchButton.js';

export function MapControls(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const zoom = useAppSelector((state) => state.map.zoom);

  const embedFeatures = useAppSelector((state) => state.main.embedFeatures);

  const locate = useAppSelector((state) => state.location.locate);

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
  }, [forceUpdate]);

  return !map ? null : (
    <Toolbar className="mx-2 mb-2">
      {(!window.fmEmbedded || !embedFeatures.includes('noMapSwitch')) && (
        <MapSwitchButton />
      )}

      <ActionIcon.Group className="ms-1">
        <MantineLongPressTooltip label={m?.main.zoomIn}>
          {({ props }) => (
            <ActionIcon
              variant="filled"
              color="gray"
              size="input-sm"
              onClick={() => {
                onMapRefocus({ zoom: zoom + 1 });
              }}
              disabled={zoom >= map.getMaxZoom()}
              {...props}
            >
              <FaPlus />
            </ActionIcon>
          )}
        </MantineLongPressTooltip>

        <MantineLongPressTooltip label={m?.main.zoomOut}>
          {({ props }) => (
            <ActionIcon
              variant="filled"
              color="gray"
              size="input-sm"
              onClick={() => {
                onMapRefocus({ zoom: zoom - 1 });
              }}
              disabled={zoom <= map.getMinZoom()}
              {...props}
            >
              <FaMinus />
            </ActionIcon>
          )}
        </MantineLongPressTooltip>
      </ActionIcon.Group>

      {(!window.fmEmbedded || !embedFeatures.includes('noLocateMe')) && (
        <MantineLongPressTooltip label={m?.main.locateMe}>
          {({ props }) => (
            <ActionIcon
              className="ms-1"
              variant={locate ? 'light' : 'filled'}
              color={gpsTracked ? 'yellow' : 'gray'}
              size="input-sm"
              onClick={() => {
                dispatch(toggleLocate(undefined));
              }}
              {...props}
            >
              <FaRegDotCircle />
            </ActionIcon>
          )}
        </MantineLongPressTooltip>
      )}

      {'exitFullscreen' in document && (
        <MantineLongPressTooltip
          label={
            document.fullscreenElement
              ? m?.general.exitFullscreen
              : m?.general.fullscreen
          }
        >
          {({ props }) => (
            <ActionIcon
              className="ms-1"
              variant="filled"
              color="gray"
              size="input-sm"
              onClick={handleFullscreenClick}
              {...props}
            >
              {document.fullscreenElement ? (
                <RiFullscreenExitLine />
              ) : (
                <RiFullscreenLine />
              )}
            </ActionIcon>
          )}
        </MantineLongPressTooltip>
      )}
    </Toolbar>
  );
}
