import React from 'react';
import { Marker, Tooltip, Polyline } from 'react-leaflet';

import { distance } from '../geoutils';

const km = Intl.NumberFormat('sk', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

export default function Measurement({ lengthMeasurePoints, onMeasureMarkerDrag }) {
  let prev = null;
  let dist = 0;

  return (
    <div>
      {lengthMeasurePoints.map((p, i) => {
        if (prev) {
          dist += distance(p.lat, p.lon, prev.lat, prev.lon);
        }
        prev = p;

        const m = (
          <Marker key={i} position={L.latLng(p.lat, p.lon)} draggable onDrag={onMeasureMarkerDrag.bind(null, i)}>
            <Tooltip direction="right" permanent><span>{km.format(dist / 1000)} km</span></Tooltip>
          </Marker>
        );

        return m;
      })}

      {lengthMeasurePoints.length > 1 && <Polyline positions={lengthMeasurePoints.map(({ lat, lon }) => [ lat, lon ])}/>}
    </div>
  );
}

Measurement.propTypes = {
  lengthMeasurePoints: React.PropTypes.arrayOf(React.PropTypes.object),
  onMeasureMarkerDrag: React.PropTypes.func.isRequired
};
