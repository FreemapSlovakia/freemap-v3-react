import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { Circle } from 'react-leaflet';
import { RichMarker } from 'fm3/components/RichMarker';
import { RootState } from 'fm3/storeCreator';

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
