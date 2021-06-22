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
import { useMessages } from 'fm3/l10nInjector';
import { LeafletMouseEvent } from 'leaflet';
import { ReactElement, useCallback, useRef, useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';
import {
  FaCamera,
  FaInfo,
  FaMapMarkerAlt,
  FaPlay,
  FaRegDotCircle,
  FaRuler,
  FaStop,
} from 'react-icons/fa';
import { MdTimeline } from 'react-icons/md';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';

export function MapContextMenu(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const [contextMenu, setContextMenu] = useState({
    i: 0,
    shown: false,
    x: 0,
    y: 0,
    lat: 0,
    lon: 0,
  });

  useMapEvent(
    'contextmenu',
    useCallback((e: LeafletMouseEvent) => {
      e.originalEvent.preventDefault();

      setContextMenu((state) => ({
        i: state.i + 1,
        shown: true,
        x: e.containerPoint.x,
        y: e.containerPoint.y,
        lat: e.latlng.lat,
        lon: e.latlng.lng,
      }));
    }, []),
  );

  const ctxMenuAnchor = useRef<HTMLDivElement | null>(null);

  const ctxMenuClose = () => {
    setContextMenu((m) => ({ ...m, shown: false }));
  };

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: contextMenu.x,
          top: contextMenu.y,
          pointerEvents: 'none',
        }}
        ref={ctxMenuAnchor}
      />

      <Overlay
        key={contextMenu.i}
        rootClose
        placement="bottom"
        target={ctxMenuAnchor.current}
        onHide={ctxMenuClose}
        show={contextMenu.shown}
        flip
      >
        <Popover id="ctx" content>
          <Dropdown.Item
            as="button"
            onSelect={() => {
              ctxMenuClose();

              dispatch(
                mapRefocus({
                  lat: contextMenu.lat,
                  lon: contextMenu.lon,
                }),
              );
            }}
          >
            <FaRegDotCircle /> {m?.mapCtxMenu.centerMap}
          </Dropdown.Item>
          <Dropdown.Item
            as="button"
            onSelect={() => {
              ctxMenuClose();
              dispatch(
                drawingMeasure({
                  position: {
                    lat: contextMenu.lat,
                    lon: contextMenu.lon,
                  },
                }),
              );
            }}
          >
            <FaRuler /> {m?.mapCtxMenu.measurePosition}
          </Dropdown.Item>
          <Dropdown.Item
            as="button"
            onSelect={() => {
              ctxMenuClose();

              dispatch(
                mapDetailsSetUserSelectedPosition({
                  lat: contextMenu.lat,
                  lon: contextMenu.lon,
                }),
              );
            }}
          >
            <FaInfo /> {m?.mapCtxMenu.queryFeatures}
          </Dropdown.Item>
          <Dropdown.Item
            as="button"
            onSelect={() => {
              ctxMenuClose();

              dispatch(
                drawingPointAdd({
                  lat: contextMenu.lat,
                  lon: contextMenu.lon,
                }),
              );

              dispatch(drawingMeasure({}));
            }}
          >
            <FaMapMarkerAlt /> {m?.mapCtxMenu.addPoint}
          </Dropdown.Item>
          <Dropdown.Item
            as="button"
            onSelect={() => {
              ctxMenuClose();

              dispatch(setTool('draw-lines'));

              dispatch(
                drawingLineAddPoint({
                  type: 'line',
                  point: {
                    id: 0,
                    lat: contextMenu.lat,
                    lon: contextMenu.lon,
                  },
                }),
              );
            }}
          >
            <MdTimeline /> {m?.mapCtxMenu.startLine}
          </Dropdown.Item>{' '}
          <Dropdown.Item
            as="button"
            onSelect={() => {
              ctxMenuClose();

              dispatch(setTool('route-planner'));

              dispatch(
                routePlannerSetStart({
                  start: {
                    lat: contextMenu.lat,
                    lon: contextMenu.lon,
                  },
                }),
              );
            }}
          >
            <FaPlay color="#409a40" /> {m?.mapCtxMenu.startRoute}
          </Dropdown.Item>
          <Dropdown.Item
            as="button"
            onSelect={() => {
              ctxMenuClose();

              dispatch(setTool('route-planner'));

              dispatch(
                routePlannerSetFinish({
                  finish: {
                    lat: contextMenu.lat,
                    lon: contextMenu.lon,
                  },
                }),
              );
            }}
          >
            <FaStop color="#d9534f" /> {m?.mapCtxMenu.finishRoute}
          </Dropdown.Item>
          {/* TODO only if photo layer is not active */}
          <Dropdown.Item
            as="button"
            onSelect={() => {
              ctxMenuClose();

              dispatch(
                galleryRequestImages({
                  lat: contextMenu.lat,
                  lon: contextMenu.lon,
                }),
              );
            }}
          >
            <FaCamera /> {m?.mapCtxMenu.showPhotos}
          </Dropdown.Item>
        </Popover>
      </Overlay>
    </>
  );
}
