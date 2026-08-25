import { RichMarker } from '@shared/components/RichMarker.js';
import {
  GhostViewpointMarker,
  useStagedViewpoint,
  ViewpointElevationTooltip,
} from '@shared/components/ViewpointMarkers.js';
import { toLatLng } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { LatLngBoundsExpression } from 'leaflet';
import { type ReactElement, useCallback, useMemo } from 'react';
import { FaEye } from 'react-icons/fa';
import { Circle, ImageOverlay } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { viewshedMoveViewpoint } from '../model/actions.js';
import {
  viewshedAtRenderedViewpointSelector,
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

  const position = useMemo(() => viewpoint && toLatLng(viewpoint), [viewpoint]);

  const { dragging, handlers } = useStagedViewpoint(
    useCallback((at) => dispatch(viewshedMoveViewpoint(at)), [dispatch]),
  );

  // `usePathOptions` compares by reference, so a fresh object would restyle the
  // circle's SVG on every render.
  const circleStyle = useMemo(
    () => ({
      color,
      weight: 1.5,
      // Dashed while it is a promise about the next render rather than the
      // edge of what is drawn.
      dashArray: outdated ? '5 5' : undefined,
      fill: false,
    }),
    [color, outdated],
  );

  const ghostStyle = useMemo(
    () => ({ color, weight: 1.5, opacity: 0.45, fill: false }),
    [color],
  );

  // Where the overlay was drawn from — not the pin, which may since have been
  // dragged somewhere nothing has been computed for.
  const renderedAt = useMemo(
    () => render && toLatLng(render.viewpoint),
    [render],
  );

  const atRenderedViewpoint = useAppSelector(
    viewshedAtRenderedViewpointSelector,
  );

  // The service answers the elevation of the place it looked from, not of
  // wherever the pin has since been dragged.
  const eyeElevation = atRenderedViewpoint
    ? (render?.eyeElevation ?? null)
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

      {/* How far the next render will look, which is the overlay's own edge
          once it answers for the pin. */}
      {position && (
        <Circle
          center={position}
          radius={grants.radiusKm * 1000}
          interactive={false}
          pathOptions={circleStyle}
        />
      )}

      {/* Where the overlay was drawn from, while the pin is elsewhere: faded,
          so it reads as the place the picture belongs to rather than as a
          second viewpoint, with the ring it actually looked out to. */}
      {(dragging || !atRenderedViewpoint) && renderedAt && render && (
        <>
          <Circle
            center={renderedAt}
            radius={render.radiusKm * 1000}
            interactive={false}
            pathOptions={ghostStyle}
          />

          <GhostViewpointMarker
            position={renderedAt}
            color={color}
            faIcon={<FaEye />}
            elevation={render.eyeElevation}
          />
        </>
      )}

      {/* An eye, in the overlay's own colour: it marks where one stands and
          looks from, and tells the pin from the panorama's standing figure. */}
      {position && (
        <RichMarker
          position={position}
          color={color}
          draggable
          eventHandlers={handlers}
          faIcon={<FaEye />}
        >
          {eyeElevation === null ? null : (
            <ViewpointElevationTooltip elevation={eyeElevation} />
          )}
        </RichMarker>
      )}
    </>
  );
}
