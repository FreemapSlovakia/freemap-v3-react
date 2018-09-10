import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Popup } from 'react-leaflet';

import RichMarker from 'fm3/components/RichMarker';
import { getPoiType } from 'fm3/poiTypes';
import * as FmPropTypes from 'fm3/propTypes';
import injectL10n from 'fm3/l10nInjector';

function ObjectsResult({ objects, t, language }) {
  return objects.map(({ id, lat, lon, tags, typeId }) => {
    const pt = getPoiType(typeId);
    const img = pt ? require(`../images/mapIcons/${pt.icon}.png`) : null;

    const { name, ele } = tags;
    const nf = Intl.NumberFormat(language, { minimumFractionDigits: 0, maximumFractionDigits: 1 });

    return (
      <RichMarker key={`poi-${id}`} position={L.latLng(lat, lon)} image={img}>
        <Popup autoPan={false}>
          <span>
            {
              pt ? (
                <>
                  {t(`objects.subcategories.${pt.id}`)}
                  {name && <br />}
                  {name}
                  {ele && <br />}
                  {ele && `${nf.format(ele)} m n. m.`}
                </>
              ) : name
            }
          </span>
        </Popup>
      </RichMarker>
    );
  });
}

ObjectsResult.propTypes = {
  objects: PropTypes.arrayOf(FmPropTypes.object).isRequired,
  language: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

export default compose(
  injectL10n(),
  connect(state => ({
    objects: state.objects.objects,
    language: state.l10n.language,
  })),
)(ObjectsResult);
