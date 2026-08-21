import { BearingLine } from '@features/location/components/BearingLine.js';
import { useFixOpacity } from '@features/location/hooks/useFixOpacity.js';
import { useHeading } from '@features/location/hooks/useHeading.js';
import { makeBeamIcon } from '@shared/beamIcon.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { divIcon, type Marker as LeafletMarker } from 'leaflet';
import { type ReactElement, useEffect, useMemo, useRef } from 'react';
import { Circle, Marker } from 'react-leaflet';

const DOT_SIZE = 26;

/**
 * A dot rather than a crosshair: this marks a position that has been measured,
 * while a crosshair says "aim here" — and the aiming one is now the reticle in
 * the middle of the screen that {@link BearingLine} measures from.
 */
const dotIcon = divIcon({
  iconSize: [DOT_SIZE, DOT_SIZE],
  iconAnchor: [DOT_SIZE / 2, DOT_SIZE / 2],
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="${DOT_SIZE}" height="${DOT_SIZE}" viewBox="-13 -13 26 26">
  <circle r="8" fill="#fff"/>
  <circle r="5.5" fill="#3388ff"/>
</svg>`,
});

/** Leaflet's own default; restated because the fade scales it. */
const CIRCLE_FILL_OPACITY = 0.2;

const BEAM_SIZE = 120;

const BEAM_RADIUS = 52;

const MIN_SPREAD = 12;

const MAX_SPREAD = 60;

const clampSpread = (spread: number) =>
  Math.min(Math.max(spread, MIN_SPREAD), MAX_SPREAD);

/**
 * The heading wedge. Its width doubles as the uncertainty readout — narrow for
 * a well-calibrated compass, wide when falling back to the GPS course.
 */
const headingBeamIcon = (spread: number) =>
  makeBeamIcon({
    halfAngle: spread,
    size: BEAM_SIZE,
    radius: BEAM_RADIUS,
    color: '#3388ff',
    innerStop: 0.2,
    innerOpacity: 0.75,
    gradientId: 'fm-heading-beam',
  });

export function LocationResult(): ReactElement | null {
  const gpsLocation = useAppSelector((state) => state.location.location);

  const heading = useHeading();

  const showBearingLine = useAppSelector(
    (state) => state.locationSettings.showBearingLine,
  );

  const opacity = useFixOpacity(gpsLocation?.at ?? null);

  const hasFix = gpsLocation !== null;

  const beamRef = useRef<LeafletMarker | null>(null);

  // Only the width changes the geometry; the angle is applied by rotation. Keyed
  // on the clamped value, since two raw accuracies that clamp alike draw the
  // same wedge and rebuilding the icon for them is pure churn — `setIcon`
  // rewrites the element's `innerHTML`.
  const spread = heading === null ? null : clampSpread(heading.spread);

  const beamIcon = useMemo(
    () => (spread === null ? null : headingBeamIcon(spread)),
    [spread],
  );

  // Leaflet compares by reference, so a fresh literal per render would move the
  // circle and both markers on every one of the ~10 heading updates a second,
  // re-projecting the circle's path each time.
  const position = useMemo(
    () => gpsLocation && { lat: gpsLocation.lat, lng: gpsLocation.lon },
    [gpsLocation],
  );

  // Styling goes through `pathOptions` rather than the flat path props, which
  // react-leaflet reads only when constructing the layer: updates run `setStyle`
  // solely when this object changes identity. Hence the memo too — without it
  // every one of the ~10 renders a second the heading drives would restyle the
  // path.
  const circleOptions = useMemo(
    () => ({
      weight: 1,
      stroke: false,
      fillOpacity: CIRCLE_FILL_OPACITY * opacity,
    }),
    [opacity],
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
      {/* `accuracy` is already the radius of the 95%-confidence circle. The
          radius stays put as the fix ages — growing it would invent a precision
          figure the receiver never reported; only the opacity says "old". */}
      <Circle
        center={position}
        radius={gpsLocation.accuracy}
        pathOptions={circleOptions}
      />

      {beamIcon && (
        <Marker
          ref={beamRef}
          icon={beamIcon}
          position={position}
          interactive={false}
          zIndexOffset={-1}
          opacity={opacity}
        />
      )}

      <Marker icon={dotIcon} position={position} opacity={opacity} />

      {showBearingLine && <BearingLine position={position} opacity={opacity} />}
    </>
  );
}
