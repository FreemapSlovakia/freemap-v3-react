import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Popup } from 'react-leaflet';

import MarkerWithInnerLabel from 'fm3/components/leaflet/MarkerWithInnerLabel';
import { toHtml, getPoiType } from 'fm3/poiTypes';
import * as FmPropTypes from 'fm3/propTypes';

function ObjectsResult({ objects }) {
  return (
    <div>
      {objects.map(({ id, lat, lon, tags, typeId }) => {
        const html = toHtml(typeId, tags);

        const pt = getPoiType(typeId);
        const img = pt ? require(`../images/mapIcons/${pt.icon}.png`) : null;

        return (
          <MarkerWithInnerLabel key={id} position={L.latLng(lat, lon)} image={img}>
            {html && <Popup autoPan={false}><span dangerouslySetInnerHTML={{ __html: html }} /></Popup>}
          </MarkerWithInnerLabel>
        );
      })}
    </div>
  );
}

ObjectsResult.propTypes = {
  objects: PropTypes.arrayOf(FmPropTypes.object).isRequired,
};

export default connect(
  state => ({
    objects: state.objects.objects,
  }),
)(ObjectsResult);
