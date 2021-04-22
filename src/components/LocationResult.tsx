import { divIcon } from 'leaflet';
import { ReactElement } from 'react';
import { Circle, Marker } from 'react-leaflet';
import { useSelector } from 'react-redux';

const circularIcon = divIcon({
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  html: `
  <svg width="40" height="40" viewBox="-20 -20 40 40">
    <path d="M-5 0H-13v0M5 0h8v0M0-5v-8M0 5v8" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-opacity=".666"/>
    <path d="M-5 0H-13v0" stroke="#000" stroke-width="1"/>
    <path d="M5 0h8v0M0-5v-8M0 5v8" stroke="#000"/>
  </svg>`,
});

export function LocationResult(): ReactElement | null {
  const gpsLocation = useSelector((state) => state.main.location);

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
