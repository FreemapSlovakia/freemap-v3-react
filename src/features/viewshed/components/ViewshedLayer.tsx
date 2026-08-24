import { useMessages } from '@features/l10n/l10nInjector.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { LatLngBoundsExpression, Marker as LeafletMarker } from 'leaflet';
import { type ReactElement, useCallback, useMemo } from 'react';
import { FaEye } from 'react-icons/fa';
import { Circle, ImageOverlay, Tooltip } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { viewshedMoveViewpoint } from '../model/actions.js';
import {
  viewshedGrantsSelector,
  viewshedOutdatedSelector,
} from '../model/selectors.js';
import { getViewshedImageUrl } from '../renderHolder.js';

type Props = {
  opacity: number;
  zIndex: number;
};

/**
 * What can be seen from the viewpoint, as one Web Mercator image stretched
 * between its corners — and the eye it was drawn from, which lives here rather
 * than among the map features so that it goes when the layer does.
 */
export default function ViewshedLayer({
  opacity,
  zIndex,
}: Props): ReactElement | null {
  const dispatch = useDispatch();

  const gm = useMessages();

  const nfEle = useNumberFormat({ maximumFractionDigits: 0 });

  // Field by field: the slice also carries the progress the side channel
  // reports several times a second, and nothing here moves while it does.
  const viewpoint = useAppSelector((state) => state.viewshed.viewpoint);

  const render = useAppSelector((state) => state.viewshed.render);

  const color = useAppSelector((state) => state.viewshedSettings.color);

  const grants = useAppSelector(viewshedGrantsSelector);

  const outdated = useAppSelector(viewshedOutdatedSelector);

  const imageUrl = render && getViewshedImageUrl();

  const bounds = useMemo<LatLngBoundsExpression | null>(
    () =>
      render && [
        [render.bounds[1], render.bounds[0]],
        [render.bounds[3], render.bounds[2]],
      ],
    [render],
  );

  const position = useMemo(
    () => viewpoint && { lat: viewpoint.lat, lng: viewpoint.lon },
    [viewpoint],
  );

  const handleDragEnd = useCallback(
    (e: { target: LeafletMarker }) => {
      const { lat, lng } = e.target.getLatLng();

      dispatch(viewshedMoveViewpoint({ lat, lon: lng }));
    },
    [dispatch],
  );

  // `usePathOptions` compares by reference, so a fresh object would restyle the
  // circle's SVG on every render.
  const circleStyle = useMemo(
    () => ({ color, weight: 1.5, dashArray: '5 5', fill: false }),
    [color],
  );

  // Only where the eye still stands where the overlay was drawn from: the
  // service answers the elevation of the place it looked from, not of wherever
  // the pin has since been dragged.
  const eyeElevation =
    render &&
    viewpoint &&
    render.viewpoint.lat === viewpoint.lat &&
    render.viewpoint.lon === viewpoint.lon
      ? render.eyeElevation
      : null;

  return (
    <>
      {imageUrl && bounds && (
        <ImageOverlay
          url={imageUrl}
          bounds={bounds}
          opacity={opacity}
          // The map layers stack in `tilePane`; the default `overlayPane` would
          // put this one above vectors and markers.
          pane="tilePane"
          zIndex={zIndex}
        />
      )}

      {position && outdated && (
        <Circle
          center={position}
          radius={grants.radiusKm * 1000}
          interactive={false}
          pathOptions={circleStyle}
        />
      )}

      {/* An eye, in the overlay's own colour: it marks where one stands and
          looks from, and tells the pin from the panorama's standing figure. */}
      {position && (
        <RichMarker
          position={position}
          color={color}
          draggable
          eventHandlers={{ dragend: handleDragEnd }}
          faIcon={<FaEye />}
        >
          {eyeElevation === null ? null : (
            <Tooltip direction="top">
              {gm?.general.viewpoint}: {nfEle.format(eyeElevation)}{' '}
              {gm?.general.masl}
            </Tooltip>
          )}
        </RichMarker>
      )}
    </>
  );
}
