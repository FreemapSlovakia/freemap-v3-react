import { connect } from 'react-redux';
import { compose } from 'redux';
import React from 'react';
import PropTypes from 'prop-types';
import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';
import * as FmPropTypes from 'fm3/propTypes';
import { mapRefocus } from 'fm3/actions/mapActions';
import injectL10n from 'fm3/l10nInjector';

function Attribution({ t, mapType, overlays }) {
  return (
    <div
      style={{
        position: 'fixed',
        right: '0px',
        bottom: '0px',
        zIndex: 10,
        backgroundColor: 'white',
        padding: '0 6px',
        borderTopLeftRadius: '4px',
        borderTop: '1px solid #ccc',
        borderLeft: '1px solid #ccc',
        fontSize: '12px',
      }}
    >
      {
        categorize(
          [
            ...baseLayers.filter(({ type }) => mapType === type),
            ...overlayLayers.filter(({ type }) => overlays.includes(type)),
          ].reduce((a, b) => [...a, ...b.attribution], []),
        ).map(({ type, attributions }, i) => [
          i > 0 ? '; ' : '',
          t(`mapLayers.type.${type}`),
          ' ',
          attributions.map((a, j) => [
            j > 0 ? ', ' : '',
            a.url ? <a key={a} href={a.url} target="_blank">{a.name || t(a.nameKey)}</a> : a.name || t(a.nameKey),
          ]),
        ])
      }
    </div>
  );
}

Attribution.propTypes = {
  overlays: FmPropTypes.overlays.isRequired,
  mapType: FmPropTypes.mapType.isRequired,
  t: PropTypes.func.isRequired,
};

function categorize(attributions) {
  const res = {};
  attributions.forEach((attribution) => {
    let x = res[attribution.type];
    if (!x) {
      x = [];
      res[attribution.type] = x;
    }
    if (!x.includes(attribution)) {
      x.push(attribution);
    }
  });
  return Object.keys(res).map(type => ({ type, attributions: res[type] }));
}

export default compose(
  injectL10n(),
  connect(
    state => ({
      zoom: state.map.zoom,
      mapType: state.map.mapType,
      overlays: state.map.overlays,
      expertMode: state.main.expertMode,
      pictureFilterIsActive: Object.keys(state.gallery.filter).some(key => state.gallery.filter[key]),
      isAdmin: !!(state.auth.user && state.auth.user.isAdmin),
    }),
    dispatch => ({
      onMapRefocus(changes) {
        dispatch(mapRefocus(changes));
      },
    }),
  ),
)(Attribution);
