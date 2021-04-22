import { ElevationChartActivePoint } from 'fm3/components/ElevationChartActivePoint';
import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { DrawingLineResult } from './DrawingLineResult';

export function DrawingLinesResult(): ReactElement {
  const lines = useSelector((state) => state.drawingLines.lines);

  return (
    <>
      {lines.map((_, i) => (
        <DrawingLineResult key={i} index={i} />
      ))}

      <ElevationChartActivePoint />
    </>
  );
}
