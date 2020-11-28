import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { ElevationChartActivePoint } from 'fm3/components/ElevationChartActivePoint';
import { DrawingLineResult } from './DrawingLineResult';
import { RootState } from 'fm3/storeCreator';

export function DrawingLinesResult(): ReactElement {
  const lines = useSelector((state: RootState) => state.drawingLines.lines);

  return (
    <>
      {lines.map((_, i) => (
        <DrawingLineResult key={i} index={i} />
      ))}

      <ElevationChartActivePoint />
    </>
  );
}
