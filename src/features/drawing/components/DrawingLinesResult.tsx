import { ElevationChartActivePoint } from '@features/elevationChart/components/ElevationChartActivePoint.js';
import { splitColorAlpha } from '@shared/colorAlpha.js';
import { COLORS } from '@shared/colors.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import Color from 'color';
import { type ReactElement, useEffect } from 'react';
import { Pane } from 'react-leaflet';
import { DrawingLineResult } from './DrawingLineResult.js';

function useLinePointColor() {
  const rawColor =
    useAppSelector((state) =>
      state.main.selection?.type === 'draw-line-poly'
        ? state.drawingLines.lines[state.main.selection.id]?.color
        : state.main.selection?.type === 'line-point'
          ? state.drawingLines.lines[state.main.selection.lineIndex]?.color
          : undefined,
    ) || COLORS.normal;

  const { color } = splitColorAlpha(rawColor);

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
      <Pane name="fm-drawing-polygons" style={{ zIndex: 399 }} />

      {lines.map((_, i) => (
        <DrawingLineResult key={i} lineIndex={i} />
      ))}

      <ElevationChartActivePoint />
    </>
  );
}
