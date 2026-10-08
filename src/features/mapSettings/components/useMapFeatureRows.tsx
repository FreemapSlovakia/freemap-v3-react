import { closeTool, selectFeature, type Tool } from '@app/store/actions.js';
import { activeMapToolSelector } from '@app/store/selectors.js';
import type { RootState } from '@app/store/store.js';
import { DataViewerToggleButton } from '@features/dataViewer/components/DataViewerToggleButton.js';
import { dataViewerDelete } from '@features/dataViewer/model/actions.js';
import { DrawingToggleButton } from '@features/drawing/components/DrawingToggleButton.js';
import { drawingLineSetLines } from '@features/drawing/model/actions/drawingLineActions.js';
import { drawingPointSetAll } from '@features/drawing/model/actions/drawingPointActions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { objectsSetFilter } from '@features/objects/model/actions.js';
import { RoutePlannerToggleButton } from '@features/routePlanner/components/RoutePlannerToggleButton.js';
import { routePlannerDelete } from '@features/routePlanner/model/actions.js';
import { searchUnselectResult } from '@features/search/model/actions.js';
import { keptSearchResultsSelector } from '@features/search/model/selectors.js';
import { TrackingToggleButton } from '@features/tracking/components/TrackingToggleButton.js';
import { trackingActions } from '@features/tracking/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { isDrawTool, toolDefinitions } from '@shared/toolDefinitions.js';
import type { ReactElement } from 'react';
import { FaPencilRuler, FaSearch } from 'react-icons/fa';
import { TbMapPins } from 'react-icons/tb';
import { useDispatch, useStore } from 'react-redux';
import { type MapFeatureId, mapFeatureCount } from '../mapFeatureCounts.js';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';

export type MapFeatureRow = {
  id: MapFeatureId;
  icon: ReactElement;
  label: string | undefined;
  count?: number;
  /**
   * In its page's header in place of the icon: the button opening its tool, as
   * a selection's toolbar has. Unset where there is none to open from here.
   */
  control?: ReactElement;
  onRemove: () => void;
};

type DrawTool = Extract<Tool, 'draw-points' | 'draw-lines' | 'draw-polygons'>;

/** The tools' features on the map, top first; only those holding anything. */
export function useMapFeatureRows(): MapFeatureRow[] {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const dispatch = useDispatch();

  const store = useStore<RootState>();

  const activeTool = useAppSelector(activeMapToolSelector);

  // Counts only: the drawn lines change on every vertex drag.
  const pinned = useAppSelector((state) => mapFeatureCount(state, 'search'));

  const objects = useAppSelector((state) => mapFeatureCount(state, 'objects'));

  const trackedDevices = useAppSelector((state) =>
    mapFeatureCount(state, 'tracking'),
  );

  const dataFeatures = useAppSelector((state) =>
    mapFeatureCount(state, 'data'),
  );

  const route = useAppSelector((state) => mapFeatureCount(state, 'route'));

  const drawing = useAppSelector((state) => mapFeatureCount(state, 'drawing'));

  const changesets = useAppSelector((state) =>
    mapFeatureCount(state, 'changesets'),
  );

  const drawingHasLine = useAppSelector((state) =>
    state.drawingLines.lines.some((line) => line.type === 'line'),
  );

  const drawingHasLines = useAppSelector(
    (state) => state.drawingLines.lines.length > 0,
  );

  // A tool's own icon and name, as its menu item has them.
  const ofTool = (tool: Tool) => {
    const def = toolDefinitions.find((td) => td.tool === tool);

    return {
      icon: def?.icon ?? <FaSearch />,
      label: def && m?.tools[def.msgKey],
    };
  };

  // The draw tool for what the drawing holds, unless one is open already.
  const drawTool: DrawTool = isDrawTool(activeTool)
    ? (activeTool as DrawTool)
    : drawingHasLine
      ? 'draw-lines'
      : drawingHasLines
        ? 'draw-polygons'
        : 'draw-points';

  // Deselecting also ends a line being drawn, which clearing the lines does
  // not; only a drawing selection, as deselecting resets other tools' modes.
  // The reducers clear a selection inside what the other rows remove.
  const removeDrawing = () => {
    const { main, drawingLines } = store.getState();

    const type = main.selection?.type;

    if (
      drawingLines.drawing ||
      type === 'draw-points' ||
      type === 'draw-line-poly' ||
      type === 'line-point'
    ) {
      dispatch(selectFeature(null));
    }

    dispatch(drawingLineSetLines([]));

    dispatch(drawingPointSetAll([]));
  };

  const rows: (MapFeatureRow | false)[] = [
    pinned !== undefined && {
      id: 'search',
      icon: <FaSearch />,
      label: msm?.searchResults,
      count: pinned,
      onRemove: () => {
        for (const result of keptSearchResultsSelector(store.getState())) {
          dispatch(searchUnselectResult(result.id));
        }
      },
    },
    objects !== undefined && {
      id: 'objects',
      icon: <TbMapPins />,
      label: m?.tools.objects,
      count: objects,
      onRemove: () => dispatch(objectsSetFilter([])),
    },
    trackedDevices !== undefined && {
      id: 'tracking',
      ...ofTool('tracking'),
      count: trackedDevices,
      control: <TrackingToggleButton />,
      onRemove: () => dispatch(trackingActions.setTrackedDevices([])),
    },
    dataFeatures !== undefined && {
      id: 'data',
      ...ofTool('import-file'),
      count: dataFeatures,
      control: <DataViewerToggleButton />,
      onRemove: () => dispatch(dataViewerDelete()),
    },
    route !== undefined && {
      id: 'route',
      ...ofTool('route-planner'),
      control: <RoutePlannerToggleButton />,
      onRemove: () => dispatch(routePlannerDelete()),
    },
    drawing !== undefined && {
      id: 'drawing',
      icon: <FaPencilRuler />,
      label: m?.tools.measurement,
      count: drawing,
      control: <DrawingToggleButton tool={drawTool} />,
      onRemove: removeDrawing,
    },
    // No control: its toolbar is up while there are any.
    changesets !== undefined && {
      id: 'changesets',
      ...ofTool('changesets'),
      count: changesets,
      // Closing the tool takes its changesets off the map.
      onRemove: () => dispatch(closeTool('changesets')),
    },
  ];

  return rows.filter((row) => row !== false);
}
