import { divIcon } from 'leaflet';
import type { ReactElement } from 'react';
import { Circle, Marker } from 'react-leaflet';
import { useAppSelector } from '../hooks/useAppSelector.js';

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

export function LocationResult(): ReactElement | null {
  const gpsLocation = useAppSelector((state) => state.main.location);

  return !gpsLocation ? null : (
    <>
      <Circle
        center={{ lat: gpsLocation.lat, lng: gpsLocation.lon }}
        radius={gpsLocation.accuracy / 2}
        weight={1}
        stroke={false}
      />

      <Marker
        icon={circularIcon}
        position={{ lat: gpsLocation.lat, lng: gpsLocation.lon }}
      />
    </>
  );
}
