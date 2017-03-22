import React from 'react';
import { connect } from 'react-redux';
import { Popup } from 'react-leaflet';

import MarkerWithInnerLabel from 'fm3/components/leaflet/MarkerWithInnerLabel';
import { toHtml, getPointType } from 'fm3/poiTypes';

function ObjectsResult({ objects }) {
  return (
    <div>
      {objects.map(({ id, lat, lon, tags }) => {
        const __html = toHtml(tags);

        const pt = getPointType(tags);
        const img = pt ? require(`../images/mapIcons/${pt.group}-${pt.id}.png`) : null;

        return (
          <MarkerWithInnerLabel key={id} position={L.latLng(lat, lon)} image={img}>
            {__html && <Popup autoPan={false}><span dangerouslySetInnerHTML={{ __html }}/></Popup>}
          </MarkerWithInnerLabel>
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
