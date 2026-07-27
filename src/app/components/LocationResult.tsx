import { useHeading } from '@features/location/hooks/useHeading.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { divIcon, type Marker as LeafletMarker } from 'leaflet';
import { type ReactElement, useEffect, useMemo, useRef } from 'react';
import { Circle, Marker } from 'react-leaflet';

const circularIcon = divIcon({
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="-20 -20 40 40">
  <g opacity=".67" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round">
    <path d="M-8 .5h-8.5v0h-.5M9 .5h9M.5-8v-9M.5 9v9"/>
    <circle cx=".5" cy=".5" r="13" stroke-linejoin="round"/>
  </g>
  <g fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round">
    <path d="M-8 .5h-8.5v0h-.5M9 .5h9M.5-8v-9M.5 9v9"/>
    <circle cx=".5" cy=".5" r="13" stroke-linejoin="round"/>
  </g>
</svg>`,
});

const BEAM_SIZE = 120;
const BEAM_RADIUS = 52;
const MIN_SPREAD = 12;
const MAX_SPREAD = 60;

const clampSpread = (spread: number) =>
  Math.min(Math.max(spread, MIN_SPREAD), MAX_SPREAD);

/**
 * A wedge fading outwards, drawn pointing north; the marker element is then
 * rotated to the heading. Its width doubles as the uncertainty readout — narrow
 * for a well-calibrated compass, wide when falling back to the GPS course.
 */
function makeBeamIcon(spread: number) {
  const half = (spread * Math.PI) / 180;

  const x1 = (BEAM_RADIUS * Math.sin(-half)).toFixed(2);
  const y1 = (-BEAM_RADIUS * Math.cos(-half)).toFixed(2);
  const x2 = (BEAM_RADIUS * Math.sin(half)).toFixed(2);
  const y2 = (-BEAM_RADIUS * Math.cos(half)).toFixed(2);

  // `display:block` on the svg is load-bearing: inline it would sit on the text
  // baseline, leaving the wrapper taller than the svg (`.leaflet-container` sets
  // `line-height: 1.5`) so `transform-origin: 50% 50%` would rotate about a
  // point below the marker anchor and swing the apex off the crosshair.
  return divIcon({
    iconSize: [BEAM_SIZE, BEAM_SIZE],
    iconAnchor: [BEAM_SIZE / 2, BEAM_SIZE / 2],
    html: `<div style="transform-origin:50% 50%">
      <svg style="display:block" xmlns="http://www.w3.org/2000/svg" width="${BEAM_SIZE}" height="${BEAM_SIZE}" viewBox="${-BEAM_SIZE / 2} ${-BEAM_SIZE / 2} ${BEAM_SIZE} ${BEAM_SIZE}">
        <radialGradient id="fm-heading-beam" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${BEAM_RADIUS}">
          <stop offset="0.2" stop-color="#3388ff" stop-opacity=".75"/>
          <stop offset="1" stop-color="#3388ff" stop-opacity="0"/>
        </radialGradient>
        <path fill="url(#fm-heading-beam)" d="M0 0L${x1} ${y1}A${BEAM_RADIUS} ${BEAM_RADIUS} 0 0 1 ${x2} ${y2}Z"/>
      </svg>
    </div>`,
  });
}

export function LocationResult(): ReactElement | null {
  const gpsLocation = useAppSelector((state) => state.location.location);

  const heading = useHeading();

  const hasFix = gpsLocation !== null;

  const beamRef = useRef<LeafletMarker | null>(null);

  // Only the width changes the geometry; the angle is applied by rotation. Keyed
  // on the clamped value, since two raw accuracies that clamp alike draw the
  // same wedge and rebuilding the icon for them is pure churn — `setIcon`
  // rewrites the element's `innerHTML`.
  const spread = heading === null ? null : clampSpread(heading.spread);

  const beamIcon = useMemo(
    () => (spread === null ? null : makeBeamIcon(spread)),
    [spread],
  );

  // Leaflet compares by reference, so a fresh literal per render would move the
  // circle and both markers on every one of the ~10 heading updates a second,
  // re-projecting the circle's path each time.
  const position = useMemo(
    () => gpsLocation && { lat: gpsLocation.lat, lng: gpsLocation.lon },
    [gpsLocation],
  );

  // Rotate by mutating the element instead of rebuilding the icon, which would
  // tear down and re-add the DOM node on every one of the ~10 updates a second.
  //
  // `hasFix` is a dependency in its own right: the marker mounts afresh whenever
  // the fix returns from null — every locate start, since `toggleLocate` clears
  // the location — while a settled heading is referentially unchanged at that
  // commit, so keying on `heading` alone would leave the new element pointing
  // north until the heading next moved. A ref callback cannot stand in for this:
  // react-leaflet attaches the forwarded ref in a layout effect but adds the
  // layer in a passive one, so the element does not exist yet at that point.
  // This effect is passive and belongs to the parent, so it runs after it does.
  useEffect(() => {
    const wrapper = beamRef.current?.getElement()?.firstElementChild;

    if (wrapper instanceof HTMLElement && hasFix && heading) {
      wrapper.style.transform = `rotate(${heading.value.toFixed(1)}deg)`;
    }
  }, [heading, hasFix]);

  return !gpsLocation || !position ? null : (
    <>
      {/* `accuracy` is already the radius of the 95%-confidence circle */}
      <Circle
        center={position}
        radius={gpsLocation.accuracy}
        weight={1}
        stroke={false}
      />

      {beamIcon && (
        <Marker
          ref={beamRef}
          icon={beamIcon}
          position={position}
          interactive={false}
          zIndexOffset={-1}
        />
      )}

      <Marker icon={circularIcon} position={position} />
    </>
  );
}
