import { DrawingPointsTool } from '@features/drawing/components/DrawingPointsTool.js';
import { MapDetailsTool } from '@features/mapDetails/components/MapDetailsTool.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { ReactElement } from 'react';
import { drawingLinePolys, selectingModeSelector } from '../store/selectors.js';
import { AsyncComponent } from './AsyncComponent.js';
import { SelectionTool } from './SelectionTool.js';

const drawingLinesToolFactory = () =>
  import(
    /* webpackChunkName: "drawing-lines-tool" */
    '@features/drawing/components/DrawingLinesTool.js'
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
