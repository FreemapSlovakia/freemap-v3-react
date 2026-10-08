import { closeTool, openTool, type Tool } from '@app/store/actions.js';
import { activeMapToolSelector } from '@app/store/selectors.js';
import { dataViewerDelete } from '@features/dataViewer/model/actions.js';
import { drawingLineSetLines } from '@features/drawing/model/actions/drawingLineActions.js';
import { drawingPointSetAll } from '@features/drawing/model/actions/drawingPointActions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { objectsSetFilter } from '@features/objects/model/actions.js';
import { routePlannerDelete } from '@features/routePlanner/model/actions.js';
import { searchUnselectResult } from '@features/search/model/actions.js';
import { trackingActions } from '@features/tracking/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { isDrawTool } from '@shared/toolDefinitions.js';
import { featureIdsEqual } from '@shared/types/featureId.js';
import type { ReactElement, ReactNode } from 'react';
import {
  FaBullseye,
  FaPencilAlt,
  FaPencilRuler,
  FaRoute,
  FaSearch,
} from 'react-icons/fa';
import { MdShapeLine } from 'react-icons/md';
import { TbMapPins } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';

export type MapFeatureRow = {
  id: string;
  icon: ReactElement;
  label: ReactNode;
  count?: number;
  /** Opens the feature's toolbar; unset where it is up while there is any. */
  onOpen?: () => void;
  /** Whether it opens to a list of its items (`MapFeatureItems`). */
  items?: true;
  onRemove: () => void;
};

/** The tools' features on the map, top first; only those holding anything. */
export function useMapFeatureRows(): MapFeatureRow[] {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const dispatch = useDispatch();

  const activeTool = useAppSelector(activeMapToolSelector);

  const shownResults = useAppSelector((state) => state.search.selectedResults);

  const previewId = useAppSelector((state) => state.search.previewId);

  // The one only being looked at is not pinned.
  const pinned = shownResults.filter(
    (result) => !previewId || !featureIdsEqual(result.id, previewId),
  );

  const objects = useAppSelector((state) =>
    state.objects.active.length ? state.objects.objects.length : undefined,
  );

  const trackedDevices = useAppSelector(
    (state) => state.tracking.trackedDevices.length,
  );

  const dataFeatures = useAppSelector(
    (state) => state.trackViewer.trackGeojson?.features.length,
  );

  const routePoints = useAppSelector(
    (state) => state.routePlanner.points.length,
  );

  const drawingLines = useAppSelector((state) => state.drawingLines.lines);

  const drawingPoints = useAppSelector(
    (state) => state.drawingPoints.points.length,
  );

  const changesets = useAppSelector(
    (state) => state.changesets.changesets.length,
  );

  const open = (tool: Tool) => () => dispatch(openTool(tool));

  // The draw tool for what the drawing holds, unless one is open already.
  const drawTool: Tool = isDrawTool(activeTool)
    ? activeTool!
    : drawingLines.some((line) => line.type === 'line')
      ? 'draw-lines'
      : drawingLines.length
        ? 'draw-polygons'
        : 'draw-points';

  const rows: (MapFeatureRow | false)[] = [
    pinned.length > 0 && {
      id: 'search',
      items: true,
      icon: <FaSearch />,
      label: msm?.searchResults,
      count: pinned.length,
      onRemove: () => {
        for (const result of pinned) {
          dispatch(searchUnselectResult(result.id));
        }
      },
    },
    objects !== undefined && {
      id: 'objects',
      items: true,
      icon: <TbMapPins />,
      label: m?.tools.objects,
      count: objects,
      onRemove: () => dispatch(objectsSetFilter([])),
    },
    trackedDevices > 0 && {
      id: 'tracking',
      items: true,
      icon: <FaBullseye />,
      label: m?.tools.tracking,
      count: trackedDevices,
      onOpen: open('tracking'),
      onRemove: () => dispatch(trackingActions.setTrackedDevices([])),
    },
    dataFeatures !== undefined && {
      id: 'data',
      items: true,
      icon: <MdShapeLine />,
      label: m?.tools.dataViewer,
      count: dataFeatures,
      onOpen: open('import-file'),
      onRemove: () => dispatch(dataViewerDelete()),
    },
    routePoints > 0 && {
      id: 'route',
      items: true,
      icon: <FaRoute />,
      label: m?.tools.routePlanner,
      onOpen: open('route-planner'),
      onRemove: () => dispatch(routePlannerDelete()),
    },
    drawingLines.length + drawingPoints > 0 && {
      id: 'drawing',
      items: true,
      icon: <FaPencilRuler />,
      label: m?.tools.measurement,
      count: drawingLines.length + drawingPoints,
      onOpen: open(drawTool),
      onRemove: () => {
        dispatch(drawingLineSetLines([]));

        dispatch(drawingPointSetAll([]));
      },
    },
    changesets > 0 && {
      id: 'changesets',
      icon: <FaPencilAlt />,
      label: m?.tools.changesets,
      count: changesets,
      onOpen: open('changesets'),
      // Closing the tool takes its changesets off the map.
      onRemove: () => dispatch(closeTool('changesets')),
    },
  ];

  return rows.filter((row) => row !== false);
}
