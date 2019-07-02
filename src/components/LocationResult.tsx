import React from 'react';
import { connect } from 'react-redux';
import { Circle } from 'react-leaflet';
import RichMarker from 'fm3/components/RichMarker';
import { RootState } from 'fm3/storeCreator';

type Props = ReturnType<typeof mapStateToProps>;

const LocationResult: React.FC<Props> = ({ gpsLocation }) => {
  return gpsLocation ? (
    <>
      <Circle
        center={{ lat: gpsLocation.lat, lng: gpsLocation.lon }}
        radius={gpsLocation.accuracy / 2}
        weight={2}
      />
      <RichMarker
        position={{ lat: gpsLocation.lat, lng: gpsLocation.lon }}
        interactive={false}
      />
    </>
  ) : null;
};

const mapStateToProps = (state: RootState) => ({
  gpsLocation: state.main.location,
});

export default connect(mapStateToProps)(LocationResult);
