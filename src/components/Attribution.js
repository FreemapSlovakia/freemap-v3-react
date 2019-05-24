import React from 'react';
import PropTypes from 'prop-types';
import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';
import * as FmPropTypes from 'fm3/propTypes';

export default function Attribution({ t, mapType, overlays, imhd }) {
  return (
    <ul style={{ padding: '10px 0 0 20px' }}>
      {
        categorize(
          [
            ...baseLayers.filter(({ type }) => mapType === type),
            ...overlayLayers.filter(({ type }) => overlays.includes(type)),
          ].reduce((a, b) => [...a, ...b.attribution], []),
        ).map(({ type, attributions }) => (
          <li key={type}>
            {t(`mapLayers.type.${type}`)}
            {' '}
            {attributions.map((a, j) => [
              j > 0 ? ', ' : '',
              a.url ? <a key={a} href={a.url} target="_blank" rel="noopener noreferrer">{a.name || t(a.nameKey)}</a> : a.name || t(a.nameKey),
            ])}
          </li>
        ))
      }
      {imhd && (
        <li>
          {'; '}
          {t('routePlanner.imhdAttribution')}
          {' ©\xa0'}
          <a href="https://imhd.sk" target="_blank" rel="noopener noreferrer">
            imhd.sk
          </a>
        </li>
      )}
    </ul>
  );
}

Attribution.propTypes = {
  overlays: FmPropTypes.overlays.isRequired,
  mapType: FmPropTypes.mapType.isRequired,
  t: PropTypes.func.isRequired,
  imhd: PropTypes.bool,
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
