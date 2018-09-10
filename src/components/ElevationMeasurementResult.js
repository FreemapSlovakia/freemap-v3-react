import React from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'react-leaflet';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { elevationMeasurementSetPoint, elevationMeasurementSetElevation } from 'fm3/actions/elevationMeasurementActions';
import RichMarker from 'fm3/components/RichMarker';
import { formatGpsCoord } from 'fm3/geoutils';
import * as FmPropTypes from 'fm3/propTypes';
import injectL10n from 'fm3/l10nInjector';

class ElevationMeasurementResult extends React.Component {
  static propTypes = {
    onPointSet: PropTypes.func.isRequired,
    onElevationClear: PropTypes.func.isRequired,
    point: FmPropTypes.point,
    elevation: PropTypes.number,
    language: PropTypes.string,
    t: PropTypes.func.isRequired,
  }

  handleDragStart = () => {
    this.props.onElevationClear(null);
  }

  handleDragEnd = (event) => {
    const { lat, lng: lon } = event.target.getLatLng();
    this.props.onPointSet({ lat, lon });
  }

  render() {
    const { point, elevation, language, t } = this.props;

    const nf1 = Intl.NumberFormat(language, { minimumFractionDigits: 0, maximumFractionDigits: 1 });

    return point && (
      <RichMarker
        autoOpenPopup
        position={L.latLng(point.lat, point.lon)}
        // onDragstart={this.handleDragStart}
        onDragend={this.handleDragEnd}
        onDrag={this.handleDrag}
        draggable
      >
        <Popup closeButton={false} autoClose={false} autoPan={false}>
          <>
            {['D', 'DM', 'DMS'].map(format => <div key={format}>{formatGpsCoord(point.lat, 'SN', format, language)} {formatGpsCoord(point.lon, 'WE', format, language)}</div>)}
            {typeof elevation === 'number' && <div>{t('measurement.elevationLine')} {nf1.format(elevation)} {t('general.masl')}</div>}
          </>
        </Popup>
      </RichMarker>
    );
  }
}

export default compose(
  injectL10n(),
  connect(
    state => ({
      elevation: state.elevationMeasurement.elevation,
      point: state.elevationMeasurement.point,
      language: state.l10n.language,
    }),
    dispatch => ({
      onPointSet(point) {
        dispatch(elevationMeasurementSetPoint(point));
      },
      onElevationClear() {
        dispatch(elevationMeasurementSetElevation(null));
      },
    }),
  ),
)(ElevationMeasurementResult);
