import React from 'react';
import { connect } from 'react-redux';
import { ElevationChartActivePoint } from 'fm3/components/ElevationChartActivePoint';
import { RootState } from 'fm3/storeCreator';
import { DrawingLineResult } from './DrawingLineResult';

type Props = ReturnType<typeof mapStateToProps>;

const DrawingLinesResultInt: React.FC<Props> = ({ lines }) => {
  return (
    <>
      {lines.map((_, i) => (
        <DrawingLineResult key={i} index={i} />
      ))}

      <ElevationChartActivePoint />
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  lines: state.drawingLines.lines,
});

export const DrawingLinesResult = connect(mapStateToProps)(
  DrawingLinesResultInt,
);
