import { ReactElement } from 'react';
import { useAppSelector } from '../hooks/useAppSelector.js';
import {
  drawingLinePolys,
  selectingModeSelector,
} from '../selectors/mainSelectors.js';
import { AsyncComponent } from './AsyncComponent.js';
import { DrawingPointsTool } from './DrawingPointsTool.js';
import { MapDetailsTool } from './MapDetailsTool.js';
import { SelectionTool } from './SelectionTool.js';

const drawingLinesToolFactory = () =>
  import(
    /* webpackChunkName: "drawing-lines-tool" */
    './DrawingLinesTool.js'
  );

export function Tools(): ReactElement {
  const tool = useAppSelector((state) => state.main.tool);

  const isSelecting = useAppSelector(selectingModeSelector);

  const drawingLines = useAppSelector(drawingLinePolys);

  return (
    <>
      {tool === 'map-details' && <MapDetailsTool />}

      {tool === 'draw-points' && <DrawingPointsTool />}

      {drawingLines && <AsyncComponent factory={drawingLinesToolFactory} />}

      {isSelecting && <SelectionTool />}
    </>
  );
}
