import { drawingLineAddPoint } from 'fm3/actions/drawingLineActions';
import {
  drawingMeasure,
  drawingPointAdd,
} from 'fm3/actions/drawingPointActions';
import { galleryRequestImages } from 'fm3/actions/galleryActions';
import { setTool } from 'fm3/actions/mainActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { mapDetailsSetUserSelectedPosition } from 'fm3/actions/mapDetailsActions';
import {
  routePlannerSetFinish,
  routePlannerSetStart,
} from 'fm3/actions/routePlannerActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useScrollClasses } from 'fm3/hooks/useScrollClasses';
import { useMessages } from 'fm3/l10nInjector';
import { LeafletMouseEvent } from 'leaflet';
import { ReactElement, useEffect, useRef, useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
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
import { OpenInExternalAppDropdownItems } from './OpenInExternalAppMenuItems';
import { useMap } from 'fm3/hooks/useMap';

export function MapContextMenu(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const [contextMenu, setContextMenu] = useState({
    shown: false,
    x: 0,
    y: 0,
    lat: 0,
    lon: 0,
    maxHeight: 100000,
  });

  const [openInExternal, setOpenInExternal] = useState(false);

  const embedFeatures = useAppSelector((state) => state.main.embedFeatures);

  const toggleRef = useRef<HTMLButtonElement>(null);

  const map = useMap();

  useEffect(() => {
    if (!map) {
      return;
    }

    function handlecontextMenu(e: LeafletMouseEvent) {
      e.originalEvent.preventDefault();

      setOpenInExternal(false);

      setContextMenu({
        shown: false,
        x: e.containerPoint.x,
        y: e.containerPoint.y,
        lat: e.latlng.lat,
        lon: e.latlng.lng,
        maxHeight:
          window.innerHeight / 2 +
          Math.abs(e.containerPoint.y - window.innerHeight / 2) -
          15,
      });

      setTimeout(() => {
        setContextMenu((m) => ({ ...m, shown: true }));
      });
    }

    map.addEventListener('contextmenu', handlecontextMenu);

    return () => {
      map.removeEventListener('contextmenu', handlecontextMenu);
    };
  }, [map]);

  const { shown } = contextMenu;

  useEffect(() => {
    if (shown) {
      toggleRef.current?.focus();
    }
  }, [shown]);

  const zoom = useAppSelector((state) => state.map.zoom);

  const mapType = useAppSelector((state) => state.map.mapType);

  const sc = useScrollClasses('vertical');

  const color = useAppSelector((state) => state.main.drawingColor);

  const width = useAppSelector((state) => state.main.drawingWidth);

  const handleToggle = (nextShow: boolean) => {
    setContextMenu((m) => ({ ...m, shown: nextShow }));
  };

  const handleSelect = (eventKey: string | null) => {
    switch (eventKey) {
      case 'center':
        dispatch(
          mapRefocus({
            lat: contextMenu.lat,
            lon: contextMenu.lon,
          }),
        );

        handleToggle(false);

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

        handleToggle(false);

        break;

      case 'details':
        dispatch(
          mapDetailsSetUserSelectedPosition({
            lat: contextMenu.lat,
            lon: contextMenu.lon,
          }),
        );

        handleToggle(false);

        break;

      case 'photos':
        dispatch(
          galleryRequestImages({
            lat: contextMenu.lat,
            lon: contextMenu.lon,
          }),
        );

        handleToggle(false);

        break;

      case 'addPoint':
        dispatch(
          drawingPointAdd({
            lat: contextMenu.lat,
            lon: contextMenu.lon,
            color,
          }),
        );

        dispatch(drawingMeasure({}));

        handleToggle(false);

        break;

      case 'startLine':
        dispatch(setTool('draw-lines'));

        dispatch(
          drawingLineAddPoint({
            type: 'line',
            color,
            width,
            point: {
              id: 0,
              lat: contextMenu.lat,
              lon: contextMenu.lon,
            },
          }),
        );

        handleToggle(false);

        break;

      case 'startRoute':
        dispatch(setTool('route-planner'));

        dispatch(
          routePlannerSetStart({
            start: {
              lat: contextMenu.lat,
              lon: contextMenu.lon,
            },
          }),
        );

        handleToggle(false);

        break;

      case 'finishRoute':
        dispatch(setTool('route-planner'));

        dispatch(
          routePlannerSetFinish({
            finish: {
              lat: contextMenu.lat,
              lon: contextMenu.lon,
            },
          }),
        );

        handleToggle(false);

        break;

      case 'openInExternal':
        setOpenInExternal(true);

        break;

      case 'back':
        setOpenInExternal(false);

        break;
    }
  };

  return (
    <Dropdown
      show={contextMenu.shown}
      onToggle={handleToggle}
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

      <Dropdown.Menu>
        <div className="fm-menu-scroller" ref={sc}>
          <div />

          {openInExternal ? (
            <>
              <Dropdown.Header>
                <FaExternalLinkAlt /> {m?.external.openInExternal}
              </Dropdown.Header>

              <Dropdown.Item as="button" eventKey="back">
                <FaChevronLeft /> {m?.mainMenu.back} <kbd>Esc</kbd>
              </Dropdown.Item>

              <Dropdown.Divider />

              <OpenInExternalAppDropdownItems
                lat={contextMenu.lat}
                lon={contextMenu.lon}
                zoom={zoom}
                mapType={mapType}
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
                  <Dropdown.Item as="button" eventKey="openInExternal">
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
