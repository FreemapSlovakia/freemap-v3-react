import React from 'react';
import { connect } from 'react-redux';
import { Marker, Popup } from 'react-leaflet';

import { toHtml } from 'fm3/poiTypes';

function ObjectsResult({ objects }) {
  return (
    <div>
      {objects.map(({ id, lat, lon, tags }) => {
        const __html = toHtml(tags);

        return (
          <Marker key={id} position={L.latLng(lat, lon)}>
            {__html && <Popup autoPan={false}><span dangerouslySetInnerHTML={{ __html }}/></Popup>}
          </Marker>
        );
      })}
    </div>
  );
}

ObjectsResult.propTypes = {
  objects: React.PropTypes.array
};

export default connect(
  function (state) {
    return {
      objects: state.objects.objects
    };
  }
)(ObjectsResult);
