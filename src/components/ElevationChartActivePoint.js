import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Tooltip } from 'react-leaflet';
import PropTypes from 'prop-types';

import RichMarker from 'fm3/components/RichMarker';
import * as FmPropTypes from 'fm3/propTypes';
import injectL10n from 'fm3/l10nInjector';

function ElevationChartActivePoint({ elevationChartActivePoint, language, t }) {
  const nf0 = Intl.NumberFormat(language, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const nf1 = Intl.NumberFormat(language, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return elevationChartActivePoint.lat && (
    <RichMarker
      faIcon="info"
      faIconLeftPadding="2px"
      color="grey"
      interactive={false}
      position={L.latLng(elevationChartActivePoint.lat, elevationChartActivePoint.lon)}
    >
      <Tooltip className="compact" offset={new L.Point(9, -25)} direction="right" permanent>
        <span>
          {nf1.format(elevationChartActivePoint.distanceFromStartInMeters / 1000)} km,
          {' '}
          {nf0.format(elevationChartActivePoint.ele)} {t('general.masl')}
        </span>
      </Tooltip>
    </RichMarker>
  );
}

ElevationChartActivePoint.propTypes = {
  elevationChartActivePoint: FmPropTypes.elevationChartProfilePoint,
  t: PropTypes.func.isRequired,
  language: PropTypes.string,
};

export default compose(
  injectL10n(),
  connect(state => ({
    elevationChartActivePoint: state.elevationChart.activePoint,
    language: state.l10n.language,
  })),
)(ElevationChartActivePoint);
