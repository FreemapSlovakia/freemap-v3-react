import React from 'react';
import { connect } from 'react-redux';
import { ElevationChartActivePoint } from 'fm3/components/ElevationChartActivePoint';
import { RootState } from 'fm3/storeCreator';
import { DistanceMeasurementResult } from './DistanceMeasurementResult';

type Props = ReturnType<typeof mapStateToProps>;

const DistanceMeasurementResultsInt: React.FC<Props> = ({ lines }) => {
  return (
    <>
      {lines.map((_, i) => (
        <DistanceMeasurementResult key={i} index={i} />
      ))}

      <ElevationChartActivePoint />
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  lines: state.distanceMeasurement.lines,
});

export const DistanceMeasurementResults = connect(mapStateToProps)(
  DistanceMeasurementResultsInt,
);
