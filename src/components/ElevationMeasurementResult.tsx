import React, { useCallback } from 'react';
import { Tooltip } from 'react-leaflet';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import {
  elevationMeasurementSetPoint,
  // elevationMeasurementSetElevation,
} from 'fm3/actions/elevationMeasurementActions';
import { RichMarker } from 'fm3/components/RichMarker';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import { DragEndEvent } from 'leaflet';
import { LatLon } from 'fm3/types/common';
import { selectFeature } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const ElevationMeasurementResultInt: React.FC<Props> = ({
  point,
  elevation,
  onPointSet,
  onSelect,
  selected,
  onValueShow,
  t,
}) => {
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { lat, lng: lon } = event.target.getLatLng();
      onPointSet({ lat, lon });
    },
    [onPointSet],
  );

  const handleTooltipClick = useCallback(() => {
    if (point) {
      onValueShow(point, elevation);
    }
  }, [onValueShow, point, elevation]);

  return (
    point && (
      <RichMarker
        autoOpenPopup
        position={{ lat: point.lat, lng: point.lon }}
        onclick={onSelect}
        ondragstart={onSelect}
        ondragend={handleDragEnd}
        color={selected ? '#65b2ff' : undefined}
        draggable
      >
        <Tooltip
          className="compact"
          offset={[0, -36]}
          direction="top"
          permanent
          interactive
        >
          <div onClick={handleTooltipClick}>
            {t('measurement.elevationInfo', { point, elevation })}
          </div>
        </Tooltip>
      </RichMarker>
    )
  );
};

const mapStateToProps = (state: RootState) => ({
  elevation: state.elevationMeasurement.elevation,
  point: state.elevationMeasurement.point,
  selected: state.main.selection?.type === 'measure-ele',
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onPointSet(point: LatLon) {
    dispatch(elevationMeasurementSetPoint(point));
  },
  onSelect() {
    dispatch(selectFeature({ type: 'measure-ele' }));
  },
  onValueShow(point: LatLon, elevation: number | null) {
    dispatch(
      toastsAdd({
        messageKey: 'measurement.elevationInfo',
        messageParams: { point, elevation },
        timeout: 5000,
        collapseKey: 'measurementInfo',
      }),
    );
  },
});

export const ElevationMeasurementResult = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(ElevationMeasurementResultInt));
