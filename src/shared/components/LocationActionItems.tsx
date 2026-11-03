import { openInExternalApp, openTool } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { pointToFeature } from '@features/dataViewer/drawingWire.js';
import {
  dataViewerAddFeatures,
  dataViewerDrawStart,
} from '@features/dataViewer/model/actions.js';
import { drawingMeasure } from '@features/drawing/model/actions/drawingPointActions.js';
import { galleryRequestImages } from '@features/gallery/model/actions.js';
import { Text } from '@features/l10n/Text.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { useOpenInExternalAppMessages } from '@features/openInExternalApp/translations/useOpenInExternalAppMessages.js';
import { searchSetQuery } from '@features/search/model/actions.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
import { OnlineOnlyItem } from '@shared/components/OnlineOnlyItem.js';
import { RouteEndpointItems } from '@shared/components/RouteEndpointItems.js';
import {
  type ViewFromHere,
  ViewFromHereItems,
} from '@shared/components/ViewFromHereItems.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { lineStyleToProperties } from '@shared/styleFromProperties.js';
import type { LatLon } from '@shared/types/common.js';
import type { ReactElement } from 'react';
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
  /** What the place is called, for the share sheet. */
  pointTitle?: string;
  pointDescription?: string;
  /** The page "Share location" hands on; without one it shares the page in view. */
  url?: string;
};

/**
 * Everything the map can do with a place: ask what is around it, name it,
 * centre on it, draw at it, route from or to it, take a view from it. Dropdown
 * items, so every menu that knows a position carries the same flat list.
 */
export function LocationActionItems({
  lat,
  lon,
  onAct,
  omit,
  pointTitle,
  pointDescription,
  url,
}: Props): ReactElement {
  const oeam = useOpenInExternalAppMessages();

  const dispatch = useDispatch();

  const embedFeatures = useAppSelector((state) => state.main.embedFeatures);

  // Read as the click comes: the drawing style and how much is already drawn
  // are nothing a menu carrying these should re-render for.
  const store = useStore<RootState>();

  return (
    <>
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
          <FaInfo />
          <MenuLabel>
            <Text k="mapCtxMenu.queryFeatures" />
          </MenuLabel>
        </OnlineOnlyItem>
      )}

      <Dropdown.Item
        as="button"
        onClick={() => {
          dispatch(drawingMeasure({ position: { lat, lon } }));

          onAct?.();
        }}
      >
        <FaRuler />
        <MenuLabel>
          <Text k="mapCtxMenu.measurePosition" />
        </MenuLabel>
      </Dropdown.Item>

      {(!window.fmEmbedded || !embedFeatures.includes('noMapSwitch')) && (
        <OnlineOnlyItem
          as="button"
          onClick={() => {
            dispatch(galleryRequestImages({ lat, lon }));

            onAct?.();
          }}
        >
          <FaCamera />
          <MenuLabel>
            <Text k="mapCtxMenu.showPhotos" />
          </MenuLabel>
        </OnlineOnlyItem>
      )}

      <Dropdown.Item
        as="button"
        onClick={() => {
          dispatch(mapRefocus({ lat, lon }));

          onAct?.();
        }}
      >
        <FaRegDotCircle />
        <MenuLabel>
          <Text k="mapCtxMenu.centerMap" />
        </MenuLabel>
      </Dropdown.Item>

      {!window.fmEmbedded && (
        <>
          <Dropdown.Divider />

          <Dropdown.Item
            as="button"
            onClick={() => {
              const { color, markerType } =
                store.getState().drawingSettings.style;

              dispatch(
                dataViewerAddFeatures({
                  features: [
                    pointToFeature({ coords: { lat, lon }, color, markerType }),
                  ],
                  select: true,
                }),
              );

              dispatch(drawingMeasure({}));

              onAct?.();
            }}
          >
            <FaMapMarkerAlt />
            <MenuLabel>
              <Text k="mapCtxMenu.addPoint" />
            </MenuLabel>
          </Dropdown.Item>

          <Dropdown.Item
            as="button"
            onClick={() => {
              dispatch(openTool('draw-lines'));

              // After the tool opens, which ends a drawing and can drop its line.
              const { drawingSettings, trackViewer } = store.getState();

              dispatch(
                dataViewerDrawStart({
                  type: 'line',
                  position: [lon, lat],
                  index: trackViewer.trackGeojson?.features.length ?? 0,
                  properties: lineStyleToProperties(
                    {},
                    { ...drawingSettings.style, type: 'line' },
                  ),
                }),
              );

              onAct?.();
            }}
          >
            <MdTimeline />
            <MenuLabel>
              <Text k="mapCtxMenu.startLine" />
            </MenuLabel>
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
            <FaLink />
            <MenuLabel>
              <Text m={oeam} k="url" />
            </MenuLabel>
          </Dropdown.Item>
        </>
      )}
    </>
  );
}
