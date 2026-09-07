import { openInExternalApp, openTool } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { drawingLineAddPoint } from '@features/drawing/model/actions/drawingLineActions.js';
import {
  drawingMeasure,
  drawingPointAdd,
} from '@features/drawing/model/actions/drawingPointActions.js';
import { galleryRequestImages } from '@features/gallery/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { useOpenInExternalAppMessages } from '@features/openInExternalApp/translations/useOpenInExternalAppMessages.js';
import { searchSetQuery } from '@features/search/model/actions.js';
import { OnlineOnlyItem } from '@shared/components/OnlineOnlyItem.js';
import { RouteEndpointItems } from '@shared/components/RouteEndpointItems.js';
import {
  type ViewFromHere,
  ViewFromHereItems,
} from '@shared/components/ViewFromHereItems.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { LatLon } from '@shared/types/common.js';
import type { ReactElement, ReactNode } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  FaCamera,
  FaInfo,
  FaLink,
  FaMapMarkerAlt,
  FaRegDotCircle,
  FaRuler,
} from 'react-icons/fa';
import { MdTimeline } from 'react-icons/md';
import { useDispatch, useStore } from 'react-redux';

type Props = LatLon & {
  /** Run after any of them — a menu or a panel over the map closes itself here. */
  onAct?: () => void;
  /** Views this place is already the subject of; see {@link ViewFromHereItems}. */
  omit?: readonly ViewFromHere[];
  /** Items slotted after the group that only looks at the place. */
  children?: ReactNode;
  /** What the place is called, for the share sheet. */
  pointTitle?: string;
  pointDescription?: string;
  /** The page "Share location" hands on; without one it shares the page in view. */
  url?: string;
};

/**
 * Everything the map can do with a place: centre on it, name it, ask what is
 * around it, draw at it, route from or to it, take a view from it. Dropdown
 * items, so the map's context menu carries them flat while any menu that knows
 * a position carries the same list behind one entry.
 */
export function LocationActionItems({
  lat,
  lon,
  onAct,
  omit,
  children,
  pointTitle,
  pointDescription,
  url,
}: Props): ReactElement {
  const m = useMessages();

  const oeam = useOpenInExternalAppMessages();

  const dispatch = useDispatch();

  const embedFeatures = useAppSelector((state) => state.main.embedFeatures);

  // Read as the click comes: the drawing style and how much is already drawn
  // are nothing a menu carrying these should re-render for.
  const store = useStore<RootState>();

  return (
    <>
      <Dropdown.Item
        as="button"
        onClick={() => {
          dispatch(mapRefocus({ lat, lon }));

          onAct?.();
        }}
      >
        <FaRegDotCircle /> {m?.mapCtxMenu.centerMap}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onClick={() => {
          dispatch(drawingMeasure({ position: { lat, lon } }));

          onAct?.();
        }}
      >
        <FaRuler /> {m?.mapCtxMenu.measurePosition}
      </Dropdown.Item>

      {(!window.fmEmbedded || embedFeatures.includes('search')) && (
        <OnlineOnlyItem
          as="button"
          onClick={() => {
            dispatch(
              searchSetQuery({
                query: `@${lat.toFixed(6)},${lon.toFixed(6)}`,
              }),
            );

            onAct?.();
          }}
        >
          <FaInfo /> {m?.mapCtxMenu.queryFeatures}
        </OnlineOnlyItem>
      )}

      {(!window.fmEmbedded || !embedFeatures.includes('noMapSwitch')) && (
        <OnlineOnlyItem
          as="button"
          onClick={() => {
            dispatch(galleryRequestImages({ lat, lon }));

            onAct?.();
          }}
        >
          <FaCamera /> {m?.mapCtxMenu.showPhotos}
        </OnlineOnlyItem>
      )}

      {children}

      {!window.fmEmbedded && (
        <>
          <Dropdown.Divider />

          <Dropdown.Item
            as="button"
            onClick={() => {
              const { drawingSettings, drawingPoints } = store.getState();

              dispatch(
                drawingPointAdd({
                  coords: { lat, lon },
                  color: drawingSettings.style.color,
                  markerType: drawingSettings.style.markerType,
                  id: drawingPoints.points.length,
                }),
              );

              dispatch(drawingMeasure({}));

              onAct?.();
            }}
          >
            <FaMapMarkerAlt /> {m?.mapCtxMenu.addPoint}
          </Dropdown.Item>

          <Dropdown.Item
            as="button"
            onClick={() => {
              const { drawingSettings, drawingLines } = store.getState();

              dispatch(openTool('draw-lines'));

              dispatch(
                drawingLineAddPoint({
                  lineProps: {
                    type: 'line',
                    color: drawingSettings.style.color,
                    width: drawingSettings.style.width,
                  },
                  point: { id: 0, lat, lon },
                  indexOfLineToSelect: drawingLines.lines.length,
                  drawing: true,
                }),
              );

              onAct?.();
            }}
          >
            <MdTimeline /> {m?.mapCtxMenu.startLine}
          </Dropdown.Item>

          <RouteEndpointItems divider lat={lat} lon={lon} onAct={onAct} />

          <ViewFromHereItems
            divider
            lat={lat}
            lon={lon}
            omit={omit}
            onAct={onAct}
          />
        </>
      )}

      {'share' in window.navigator && (
        <>
          <Dropdown.Divider />

          <Dropdown.Item
            as="button"
            onClick={() => {
              dispatch(
                openInExternalApp({
                  where: 'url',
                  lat,
                  lon,
                  zoom: store.getState().map.zoom,
                  includePoint: true,
                  pointTitle,
                  pointDescription,
                  url,
                }),
              );

              onAct?.();
            }}
          >
            <FaLink /> {oeam?.url}
          </Dropdown.Item>
        </>
      )}
    </>
  );
}
