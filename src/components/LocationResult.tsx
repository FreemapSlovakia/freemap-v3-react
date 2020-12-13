import { RichMarker } from 'fm3/components/RichMarker';
import { RootState } from 'fm3/storeCreator';
import { ReactElement } from 'react';
import { Circle } from 'react-leaflet';
import { useSelector } from 'react-redux';

export function LocationResult(): ReactElement | null {
  const gpsLocation = useSelector((state: RootState) => state.main.location);

  return !gpsLocation ? null : (
    <>
      <Circle
        center={{ lat: gpsLocation.lat, lng: gpsLocation.lon }}
        radius={gpsLocation.accuracy / 2}
        weight={1}
      />
      <RichMarker
        position={{ lat: gpsLocation.lat, lng: gpsLocation.lon }}
        interactive={false}
      />
    </>
  );
}
