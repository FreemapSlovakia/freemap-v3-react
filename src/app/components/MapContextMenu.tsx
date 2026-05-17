import { drawingLineAddPoint } from '@features/drawing/model/actions/drawingLineActions.js';
import {
  drawingMeasure,
  drawingPointAdd,
} from '@features/drawing/model/actions/drawingPointActions.js';
import { galleryRequestImages } from '@features/gallery/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useMap } from '@features/map/hooks/useMap.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { OpenInExternalAppDropdownItems } from '@features/openInExternalApp/components/OpenInExternalAppMenuItems.js';
import {
  routePlannerSetFinish,
  routePlannerSetStart,
} from '@features/routePlanner/model/actions.js';
import { searchSetQuery } from '@features/search/model/actions.js';
import { Kbd, Menu, ScrollArea, UnstyledButton } from '@mantine/core';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useMenuHandler } from '@shared/hooks/useMenuHandler.js';
import { useSubmenuScrollMemory } from '@shared/hooks/useSubmenuScrollMemory.js';
import { LeafletMouseEvent } from 'leaflet';
import {
  type ReactElement,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  FaCamera,
  FaChevronLeft,
  FaChevronRight,
  FaExternalLinkAlt,
  FaInfo,
  FaMapMarkerAlt,
  FaPlay,
  FaRegDotCircle,
  FaRuler,
  FaStop,
} from 'react-icons/fa';
import { MdTimeline } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { setTool } from '../store/actions.js';

const initialState = {
  x: 0,
  y: 0,
  lat: 0,
  lon: 0,
  maxHeight: 100000,
};

const SYNTH_EVENT = {
  preventDefault() {},
} as SyntheticEvent<unknown, Event>;

export function MapContextMenu(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const [contextMenu, setContextMenu] = useState(initialState);

  const embedFeatures = useAppSelector((state) => state.main.embedFeatures);

  const toggleRef = useRef<HTMLButtonElement>(null);

  const map = useMap();

  const {
    handleSelect,
    menuShown,
    handleMenuToggle,
    closeMenu,
    submenu,
    extraHandler,
  } = useMenuHandler();

  const viewportRef = useRef<HTMLDivElement>(null);

  useSubmenuScrollMemory(viewportRef, submenu);

  useEffect(() => {
    if (!map) {
      return;
    }

    function handlecontextMenu(e: LeafletMouseEvent) {
      e.originalEvent.preventDefault();

      closeMenu();

      handleMenuToggle(true);

      setContextMenu({
        x: e.containerPoint.x,
        y: e.containerPoint.y,
        lat: e.latlng.lat,
        lon: e.latlng.lng,
        maxHeight:
          window.innerHeight / 2 +
          Math.abs(e.containerPoint.y - window.innerHeight / 2) -
          15,
      });
    }

    map.addEventListener('contextmenu', handlecontextMenu);

    return () => {
      map.removeEventListener('contextmenu', handlecontextMenu);
    };
  }, [closeMenu, handleMenuToggle, map]);

  useEffect(() => {
    if (menuShown) {
      toggleRef.current?.focus();
    }
  }, [menuShown]);

  const zoom = useAppSelector((state) => state.map.zoom);

  const color = useAppSelector((state) => state.drawingSettings.drawingColor);

  const width = useAppSelector((state) => state.drawingSettings.drawingWidth);

  const linesLength = useAppSelector(
    (state) => state.drawingLines.lines.length,
  );

  const pointsLength = useAppSelector(
    (state) => state.drawingPoints.points.length,
  );

  extraHandler.current = useCallback(
    (eventKey: string | null) => {
      switch (eventKey) {
        case 'center':
          dispatch(
            mapRefocus({
              lat: contextMenu.lat,
              lon: contextMenu.lon,
            }),
          );

          closeMenu();

          break;

        case 'measure':
          dispatch(
            drawingMeasure({
              position: {
                lat: contextMenu.lat,
                lon: contextMenu.lon,
              },
            }),
          );

          closeMenu();

          break;

        case 'details':
          dispatch(
            searchSetQuery({
              query:
                '@' +
                contextMenu.lat.toFixed(6) +
                ',' +
                contextMenu.lon.toFixed(6),
            }),
          );

          closeMenu();

          break;

        case 'photos':
          dispatch(
            galleryRequestImages({
              lat: contextMenu.lat,
              lon: contextMenu.lon,
            }),
          );

          closeMenu();

          break;

        case 'addPoint':
          dispatch(
            drawingPointAdd({
              coords: {
                lat: contextMenu.lat,
                lon: contextMenu.lon,
              },
              color,
              id: pointsLength,
            }),
          );

          dispatch(drawingMeasure({}));

          closeMenu();

          break;

        case 'startLine':
          dispatch(setTool('draw-lines'));

          dispatch(
            drawingLineAddPoint({
              lineProps: {
                type: 'line',
                color,
                width,
              },
              point: {
                id: 0,
                lat: contextMenu.lat,
                lon: contextMenu.lon,
              },
              indexOfLineToSelect: linesLength,
            }),
          );

          closeMenu();

          break;

        case 'startRoute':
          dispatch(setTool('route-planner'));

          dispatch(
            routePlannerSetStart({
              lat: contextMenu.lat,
              lon: contextMenu.lon,
            }),
          );

          closeMenu();

          break;

        case 'finishRoute':
          dispatch(setTool('route-planner'));

          dispatch(
            routePlannerSetFinish({
              lat: contextMenu.lat,
              lon: contextMenu.lon,
            }),
          );

          closeMenu();

          break;

        default:
          return false;
      }

      return true;
    },
    [
      closeMenu,
      color,
      contextMenu.lat,
      contextMenu.lon,
      dispatch,
      width,
      linesLength,
      pointsLength,
    ],
  );

  const select = (eventKey: string) => () =>
    handleSelect(eventKey, SYNTH_EVENT);

  return (
    <Menu
      opened={menuShown}
      onChange={handleMenuToggle}
      closeOnItemClick={false}
    >
      <Menu.Target>
        <UnstyledButton
          ref={toggleRef}
          style={{
            width: 0,
            height: 0,
            margin: 0,
            padding: 0,
            border: 0,
            position: 'absolute',
            left: contextMenu.x,
            top: contextMenu.y,
            pointerEvents: 'none',
          }}
        />
      </Menu.Target>

      <Menu.Dropdown>
        <ScrollArea.Autosize
          mah="calc(100dvh - 160px)"
          type="auto"
          viewportRef={viewportRef}
        >
          {submenu === 'openExternally' ? (
            <>
              <Menu.Label>
                <FaExternalLinkAlt /> {m?.external.openInExternal}
              </Menu.Label>

              <Menu.Item
                leftSection={<FaChevronLeft />}
                rightSection={<Kbd>Esc</Kbd>}
                onClick={select('submenu-')}
              >
                {m?.mainMenu.back}
              </Menu.Item>

              <Menu.Divider />

              <OpenInExternalAppDropdownItems
                lat={contextMenu.lat}
                lon={contextMenu.lon}
                zoom={zoom}
                includePoint
                copy={false}
                onSelect={(eventKey) => handleSelect(eventKey, SYNTH_EVENT)}
              />
            </>
          ) : (
            <>
              <Menu.Item
                leftSection={<FaRegDotCircle />}
                onClick={select('center')}
              >
                {m?.mapCtxMenu.centerMap}
              </Menu.Item>

              <Menu.Item leftSection={<FaRuler />} onClick={select('measure')}>
                {m?.mapCtxMenu.measurePosition}
              </Menu.Item>

              {(!window.fmEmbedded || embedFeatures.includes('search')) && (
                <Menu.Item leftSection={<FaInfo />} onClick={select('details')}>
                  {m?.mapCtxMenu.queryFeatures}
                </Menu.Item>
              )}

              {(!window.fmEmbedded ||
                !embedFeatures.includes('noMapSwitch')) && (
                <Menu.Item
                  leftSection={<FaCamera />}
                  onClick={select('photos')}
                >
                  {m?.mapCtxMenu.showPhotos}
                </Menu.Item>
              )}

              {!window.fmEmbedded && (
                <>
                  <Menu.Item
                    leftSection={<FaExternalLinkAlt />}
                    rightSection={<FaChevronRight />}
                    onClick={select('submenu-openExternally')}
                  >
                    {m?.external.openInExternal}
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item
                    leftSection={<FaMapMarkerAlt />}
                    onClick={select('addPoint')}
                  >
                    {m?.mapCtxMenu.addPoint}
                  </Menu.Item>

                  <Menu.Item
                    leftSection={<MdTimeline />}
                    onClick={select('startLine')}
                  >
                    {m?.mapCtxMenu.startLine}
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item
                    leftSection={<FaPlay color="#409a40" />}
                    onClick={select('startRoute')}
                  >
                    {m?.mapCtxMenu.startRoute}
                  </Menu.Item>

                  <Menu.Item
                    leftSection={<FaStop color="#d9534f" />}
                    onClick={select('finishRoute')}
                  >
                    {m?.mapCtxMenu.finishRoute}
                  </Menu.Item>
                </>
              )}
            </>
          )}
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
}
