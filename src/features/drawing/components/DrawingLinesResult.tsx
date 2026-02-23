import { ElevationChartActivePoint } from '@features/elevationChart/components/ElevationChartActivePoint.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import Color from 'color';
import { type ReactElement, useEffect } from 'react';
import { colors } from '../../../constants.js';
import { DrawingLineResult } from './DrawingLineResult.js';

function useLinePointColor() {
  const color =
    useAppSelector((state) =>
      state.main.selection?.type === 'draw-line-poly'
        ? state.drawingLines.lines[state.main.selection.id]?.color
        : state.main.selection?.type === 'line-point'
          ? state.drawingLines.lines[state.main.selection.lineIndex]?.color
          : undefined,
    ) || colors.normal;

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty('--color-normal', color);

    root.style.setProperty(
      '--color-selected',
      Color(color).lighten(0.75).hex(),
    );
  }, [color]);
}

export function DrawingLinesResult(): ReactElement {
  const lines = useAppSelector((state) => state.drawingLines.lines);

  useLinePointColor();

  return (
    <>
      {lines.map((_, i) => (
        <DrawingLineResult key={i} lineIndex={i} />
      ))}

      <ElevationChartActivePoint />
    </>
  );
}
