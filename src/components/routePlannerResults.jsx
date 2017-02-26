import React from 'react';
import { Marker} from 'react-leaflet';

export default function RoutePlannerResults({routePlannerPoints}) {
  const p = routePlannerPoints
    
  return (
      <div>
        {p.start.lat && <Marker key="routePlannerStart" position={L.latLng(p.start.lat, p.start.lon)} />}
        {p.finish.lat && <Marker key="routePlannerEnd" position={L.latLng(p.finish.lat, p.finish.lon)} />}
      </div>
  )
}

RoutePlannerResults.propTypes = {
  routePlannerPoints: React.PropTypes.object,
};
