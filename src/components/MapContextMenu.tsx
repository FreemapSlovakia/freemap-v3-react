import { LeafletMouseEvent } from 'leaflet';
import {
  type ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Dropdown } from 'react-bootstrap';
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
import { drawingLineAddPoint } from '../features/drawing/model/actions/drawingLineActions.js';
import {
  drawingMeasure,
  drawingPointAdd,
} from '../features/drawing/model/actions/drawingPointActions.js';
import { galleryRequestImages } from '../features/gallery/model/actions.js';
import { setTool } from '../actions/mainActions.js';
import { mapRefocus } from '../features/map/model/actions.js';
import {
  routePlannerSetFinish,
  routePlannerSetStart,
} from '../features/routePlanner/model/actions.js';
import { searchSetQuery } from '../features/search/model/actions.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useMap } from '../hooks/useMap.js';
import { useMenuHandler } from '../hooks/useMenuHandler.js';
import { useScrollClasses } from '../hooks/useScrollClasses.js';
import { useMessages } from '../l10nInjector.js';
import { OpenInExternalAppDropdownItems } from './OpenInExternalAppMenuItems.js';

const initialState = {
  x: 0,
  y: 0,
  lat: 0,
  lon: 0,
  maxHeight: 100000,
};

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

  const sc = useScrollClasses('vertical');

  const color = useAppSelector((state) => state.main.drawingColor);

  const width = useAppSelector((state) => state.main.drawingWidth);

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

  return (
    <Dropdown
      show={menuShown}
      onToggle={handleMenuToggle}
      onSelect={handleSelect}
      autoClose="outside"
    >
      <Dropdown.Toggle
        bsPrefix="fm-dropdown-toggle-nocaret"
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

      <Dropdown.Menu
        className="fm-dropdown-with-scroller"
        // this modifier somehow fixes menu
        popperConfig={{
          modifiers: [
            {
              name: 'fixFlashing',
              phase: 'afterMain',
              enabled: true,
              effect() {},
            },
          ],
        }}
      >
        <div className="fm-menu-scroller" ref={sc}>
          <div />

          {submenu === 'openExternally' ? (
            <>
              <Dropdown.Header>
                <FaExternalLinkAlt /> {m?.external.openInExternal}
              </Dropdown.Header>

              <Dropdown.Item as="button" eventKey="submenu-">
                <FaChevronLeft /> {m?.mainMenu.back} <kbd>Esc</kbd>
              </Dropdown.Item>

              <Dropdown.Divider />

              <OpenInExternalAppDropdownItems
                lat={contextMenu.lat}
                lon={contextMenu.lon}
                zoom={zoom}
                includePoint
                copy={false}
              />
            </>
          ) : (
            <>
              <Dropdown.Item as="button" eventKey="center">
                <FaRegDotCircle /> {m?.mapCtxMenu.centerMap}
              </Dropdown.Item>

              <Dropdown.Item as="button" eventKey="measure">
                <FaRuler /> {m?.mapCtxMenu.measurePosition}
              </Dropdown.Item>

              {(!window.fmEmbedded || embedFeatures.includes('search')) && (
                <Dropdown.Item as="button" eventKey="details">
                  <FaInfo /> {m?.mapCtxMenu.queryFeatures}
                </Dropdown.Item>
              )}

              {(!window.fmEmbedded ||
                !embedFeatures.includes('noMapSwitch')) && (
                <Dropdown.Item as="button" eventKey="photos">
                  <FaCamera /> {m?.mapCtxMenu.showPhotos}
                </Dropdown.Item>
              )}

              {!window.fmEmbedded && (
                <>
                  <Dropdown.Item as="button" eventKey="submenu-openExternally">
                    <FaExternalLinkAlt /> {m?.external.openInExternal}{' '}
                    <FaChevronRight />
                  </Dropdown.Item>

                  <Dropdown.Divider />

                  <Dropdown.Item as="button" eventKey="addPoint">
                    <FaMapMarkerAlt /> {m?.mapCtxMenu.addPoint}
                  </Dropdown.Item>

                  <Dropdown.Item as="button" eventKey="startLine">
                    <MdTimeline /> {m?.mapCtxMenu.startLine}
                  </Dropdown.Item>

                  <Dropdown.Divider />

                  <Dropdown.Item as="button" eventKey="startRoute">
                    <FaPlay color="#409a40" /> {m?.mapCtxMenu.startRoute}
                  </Dropdown.Item>

                  <Dropdown.Item as="button" eventKey="finishRoute">
                    <FaStop color="#d9534f" /> {m?.mapCtxMenu.finishRoute}
                  </Dropdown.Item>
                </>
              )}
            </>
          )}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}
