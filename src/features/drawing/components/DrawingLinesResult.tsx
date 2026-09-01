import { splitColorAlpha } from '@shared/colorAlpha.js';
import { COLORS } from '@shared/colors.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useEffect } from 'react';
import { Pane } from 'react-leaflet';
import { DrawingLineResult, HIGHLIGHT_PANE } from './DrawingLineResult.js';

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
    document.documentElement.style.setProperty('--color-normal', color);
  }, [color]);
}

export function DrawingLinesResult(): ReactElement {
  const lines = useAppSelector((state) => state.drawingLines.lines);

  useLinePointColor();

  return (
    <>
      {/* Below the lines (overlayPane, zIndex 400) and the polygons, so a
          selected shape's halo shows as an outline around its own colors. */}
      <Pane name={HIGHLIGHT_PANE} style={{ zIndex: 398 }} />

      <Pane name="fm-drawing-polygons" style={{ zIndex: 399 }} />

      {lines.map((_, i) => (
        <DrawingLineResult key={i} lineIndex={i} />
      ))}
    </>
  );
}
