import { useMapCenter } from '@features/map/hooks/useMapCenter.js';
import { formatDistance } from '@shared/distanceFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { bearing } from '@turf/bearing';
import { distance } from '@turf/distance';
import type { LatLngLiteral } from 'leaflet';
import { type ReactElement, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMap } from 'react-leaflet';
import classes from './BearingLine.module.css';

const CROSSHAIR_SIZE = 40;

/** Clear of the crosshair's outer ring, so the line starts beside it. */
const CROSSHAIR_CLEARANCE_PX = 20;

/** Likewise clear of the located dot at the far end. */
const DOT_CLEARANCE_PX = 13;

const CLEARANCE_PX = CROSSHAIR_CLEARANCE_PX + DOT_CLEARANCE_PX;

/**
 * Nearer than this the crosshair sits on the located dot, where the line has no
 * direction left to show and its readout nothing to say — which is the whole of
 * the time the map is following the position, so the display simply stays away
 * until the map is panned off it. Measured from the clearances, since below
 * those there is no line left to draw at all.
 */
const SHOW_GAP_PX = CLEARANCE_PX + 16;

/**
 * Hysteresis, because a fix wanders by a few metres even standing still, and at
 * a close zoom those metres straddle the threshold: appearing and vanishing
 * once a second is worse than waiting a little longer to leave.
 */
const HIDE_GAP_PX = CLEARANCE_PX + 4;

type Props = {
  position: LatLngLiteral;
  /**
   * Fades the line and the readout with the age of the fix, as the rest of the
   * located display does. The crosshair is exempt: it marks the middle of the
   * screen, which is as true of a minute-old fix as of a fresh one.
   */
  opacity: number;
};

/**
 * How far away what the map is looking at is, and which way to walk to reach
 * it: a crosshair in the middle of the screen, a dotted line to the located
 * position, and the distance and bearing along it.
 *
 * The bearing is measured at the fix, pointing at the crosshair — the heading
 * to steer, and the only one comparable with the heading beam, which is drawn
 * at the same point and says which way the user currently faces. Distance is
 * the same either way round.
 *
 * Drawn in screen space, in an overlay portalled into the map container, rather
 * than as Leaflet layers: the crosshair belongs to the screen, not to the
 * ground under it, and a layer would ride every pane transform — sliding off
 * the middle of the screen for the length of each zoom animation and jittering
 * a frame behind each pan.
 */
export function BearingLine({ position, opacity }: Props): ReactElement {
  const map = useMap();

  const center = useMapCenter();

  const language = useAppSelector((state) => state.l10n.language);

  const [shown, setShown] = useState(false);

  // A zoom animation transforms the map pane over ~250 ms while Leaflet already
  // reports the view it is animating *to* and suppresses `move` throughout, so
  // there is no honest place to put the far end of the line during it: the
  // computed one is where the dot will land, not where it currently is. The
  // line and its readout step out for the duration, leaving the crosshair,
  // which marks the screen and is right throughout. Panning needs none of this;
  // it fires `move` per frame.
  const [zooming, setZooming] = useState(false);

  useEffect(() => {
    const startZoom = () => setZooming(true);

    const endZoom = () => setZooming(false);

    // Only animated zooms fire `zoomanim`; the rest never set the flag.
    map.on('zoomanim', startZoom);

    map.on('zoomend', endZoom);

    return () => {
      map.off('zoomanim', startZoom);

      map.off('zoomend', endZoom);
    };
  }, [map]);

  const size = map.getSize();

  // The middle of the container is the centre by definition, and is where the
  // stylesheet puts the crosshair.
  const centerPoint = size.divideBy(2);

  const positionPoint = map.latLngToContainerPoint(position);

  const gap = centerPoint.distanceTo(positionPoint);

  const show = gap >= (shown ? HIDE_GAP_PX : SHOW_GAP_PX);

  // Adjusting state while rendering, the sanctioned way to derive a value from
  // a previous one: React re-runs this render straight away, and the second run
  // settles because the outcome only depends on `gap`, which has not moved.
  if (show !== shown) {
    setShown(show);
  }

  const ux = gap > 0 ? (positionPoint.x - centerPoint.x) / gap : 0;

  const uy = gap > 0 ? (positionPoint.y - centerPoint.y) / gap : 0;

  // Anything longer has already left the screen, and the dots are drawn one per
  // 13 px: a position a few hundred kilometres off at close zoom would ask the
  // renderer for hundreds of thousands of them.
  const length = Math.max(0, Math.min(gap - CLEARANCE_PX, size.x + size.y));

  const x1 = Math.round(centerPoint.x + ux * CROSSHAIR_CLEARANCE_PX);

  const y1 = Math.round(centerPoint.y + uy * CROSSHAIR_CLEARANCE_PX);

  const x2 = Math.round(x1 + ux * length);

  const y2 = Math.round(y1 + uy * length);

  const positionCoord = [position.lng, position.lat];

  const centerCoord = [center.lng, center.lat];

  return createPortal(
    <div
      className={classes.hud}
      style={{ visibility: show ? 'visible' : 'hidden' }}
    >
      {show && !zooming && (
        <svg className={classes.line} style={{ opacity }}>
          <line className={classes.halo} x1={x1} y1={y1} x2={x2} y2={y2} />

          <line className={classes.stroke} x1={x1} y1={y1} x2={x2} y2={y2} />
        </svg>
      )}

      <svg
        className={classes.crosshair}
        width={CROSSHAIR_SIZE}
        height={CROSSHAIR_SIZE}
        viewBox="-20 -20 40 40"
      >
        <g
          opacity=".67"
          fill="none"
          stroke="#fff"
          strokeWidth="4.5"
          strokeLinecap="round"
        >
          <path d="M-8 .5h-8.5v0h-.5M9 .5h9M.5-8v-9M.5 9v9" />

          <circle cx=".5" cy=".5" r="13" strokeLinejoin="round" />
        </g>

        <g fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round">
          <path d="M-8 .5h-8.5v0h-.5M9 .5h9M.5-8v-9M.5 9v9" />

          <circle cx=".5" cy=".5" r="13" strokeLinejoin="round" />
        </g>
      </svg>

      {show && !zooming && (
        <div className={classes.readout} style={{ opacity }}>
          {formatDistance(
            distance(positionCoord, centerCoord, { units: 'meters' }),
            language,
          )}{' '}
          · {Math.round(bearing(positionCoord, centerCoord) + 360) % 360}°
        </div>
      )}
    </div>,
    map.getContainer(),
  );
}
