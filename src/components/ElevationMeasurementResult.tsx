import React from 'react';
import { Popup } from 'react-leaflet';
import { connect } from 'react-redux';
import { compose, Dispatch } from 'redux';
import {
  elevationMeasurementSetPoint,
  elevationMeasurementSetElevation,
} from 'fm3/actions/elevationMeasurementActions';
import RichMarker from 'fm3/components/RichMarker';
import { latLonToString } from 'fm3/geoutils';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import { DragEndEvent } from 'leaflet';
import { LatLon } from 'fm3/types/common';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

class ElevationMeasurementResult extends React.Component<Props> {
  handleDragStart = () => {
    this.props.onElevationClear();
  };

  handleDragEnd = (event: DragEndEvent) => {
    const { lat, lng: lon } = event.target.getLatLng();
    this.props.onPointSet({ lat, lon });
  };

  render() {
    const { point, elevation, language, t } = this.props;

    const nf1 = Intl.NumberFormat(language, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    });

    return (
      point && (
        <RichMarker
          autoOpenPopup
          position={{ lat: point.lat, lng: point.lon }}
          // onDragstart={this.handleDragStart}
          ondragend={this.handleDragEnd}
          // ondrag={this.handleDrag}
          draggable
        >
          <Popup closeButton={false} autoClose={false} autoPan={false}>
            <>
              {(['D', 'DM', 'DMS'] as const).map(format => (
                <div key={format}>
                  {latLonToString(point, language, format)}
                </div>
              ))}
              {typeof elevation === 'number' && (
                <div>
                  {t('measurement.elevationLine')} {nf1.format(elevation)}{' '}
                  {t('general.masl')}
                </div>
              )}
            </>
          </Popup>
        </RichMarker>
      )
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  elevation: state.elevationMeasurement.elevation,
  point: state.elevationMeasurement.point,
  language: state.l10n.language,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onPointSet(point: LatLon) {
    dispatch(elevationMeasurementSetPoint(point));
  },
  onElevationClear() {
    dispatch(elevationMeasurementSetElevation(null));
  },
});

export default compose(
  withTranslator,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(ElevationMeasurementResult);
