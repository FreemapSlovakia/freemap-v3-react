import { closeTool, type Tool } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { ChangesetLabel } from '@features/changesets/components/ChangesetLabel.js';
import { changesetsEndInspection } from '@features/changesets/model/inspectorToast.js';
import { loneInspectionSelector } from '@features/changesets/model/selectors.js';
import { DataViewerToggleButton } from '@features/dataViewer/components/DataViewerToggleButton.js';
import { dataViewerDelete } from '@features/dataViewer/model/actions.js';
import { GpsRecorderToggleButton } from '@features/gpsRecorder/components/GpsRecorderToggleButton.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { objectsSetFilter } from '@features/objects/model/actions.js';
import { RoutePlannerToggleButton } from '@features/routePlanner/components/RoutePlannerToggleButton.js';
import { routePlannerDelete } from '@features/routePlanner/model/actions.js';
import { searchUnselectResult } from '@features/search/model/actions.js';
import { keptSearchResultsSelector } from '@features/search/model/selectors.js';
import { TrackingToggleButton } from '@features/tracking/components/TrackingToggleButton.js';
import { trackingActions } from '@features/tracking/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { toolDefinitions } from '@shared/toolDefinitions.js';
import type { ReactElement, ReactNode } from 'react';
import { FaSearch } from 'react-icons/fa';
import { TbMapPins } from 'react-icons/tb';
import { useDispatch, useStore } from 'react-redux';
import { type MapFeatureId, mapFeatureCount } from '../mapFeatureCounts.js';

export type MapFeatureRow = {
  id: MapFeatureId;
  icon: ReactElement;
  label: string | undefined;
  /** Shown in place of the label, which stays the text naming the row. */
  display?: ReactNode;
  /** Muted under the label, in its row only. */
  subline?: string;
  count?: number;
  /**
   * In its page's header in place of the icon: the button opening its tool, as
   * a selection's toolbar has. Unset where there is none to open from here.
   */
  control?: ReactElement;
  /** Unset where removing isn't the panel's to offer. */
  onRemove?: () => void;
};

/** The tools' features on the map, top first; only those holding anything. */
export function useMapFeatureRows(): MapFeatureRow[] {
  const m = useMessages();

  const dispatch = useDispatch();

  const store = useStore<RootState>();

  // Counts only: the drawn lines change on every vertex drag.
  const pinned = useAppSelector((state) => mapFeatureCount(state, 'search'));

  const objects = useAppSelector((state) => mapFeatureCount(state, 'objects'));

  const recorderSegments = useAppSelector((state) =>
    mapFeatureCount(state, 'gps-recorder'),
  );

  const trackedDevices = useAppSelector((state) =>
    mapFeatureCount(state, 'tracking'),
  );

  const dataFeatures = useAppSelector((state) =>
    mapFeatureCount(state, 'data'),
  );

  const route = useAppSelector((state) => mapFeatureCount(state, 'route'));

  const changesets = useAppSelector((state) =>
    mapFeatureCount(state, 'changesets'),
  );

  const loneInspection = useAppSelector(loneInspectionSelector);

  const inspectedId = useAppSelector(
    (state) => state.changesetInspector.inspected?.id,
  );

  const inspectedChangeset = useAppSelector(
    (state) => state.changesetInspector.inspected?.changeset,
  );

  // A tool's own icon and name, as its menu item has them.
  const ofTool = (tool: Tool) => {
    const def = toolDefinitions.find((td) => td.tool === tool);

    return {
      icon: def?.icon ?? <FaSearch />,
      label: def && m?.tools[def.msgKey],
    };
  };

  const rows: (MapFeatureRow | false)[] = [
    pinned !== undefined && {
      id: 'search',
      icon: <FaSearch />,
      label: m?.search.result,
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
    recorderSegments !== undefined && {
      id: 'gps-recorder',
      ...ofTool('gps-recorder'),
      count: recorderSegments,
      control: <GpsRecorderToggleButton />,
      // None: it would delete the track on the recorder, not just the map's copy.
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
    // No control: its toolbar is up while there are any.
    changesets !== undefined && {
      id: 'changesets',
      ...ofTool('changesets'),
      ...(loneInspection
        ? {
            // Named as the inspector's breadcrumb names it.
            display:
              inspectedId === undefined ? undefined : (
                <ChangesetLabel id={inspectedId} />
              ),
            subline: inspectedChangeset
              ? [inspectedChangeset.userName, inspectedChangeset.description]
                  .filter(Boolean)
                  .join(' · ')
              : undefined,
            onRemove: () => {
              for (const action of changesetsEndInspection()) {
                dispatch(action);
              }
            },
          }
        : {
            count: changesets,
            // Closing the tool takes its changesets off the map.
            onRemove: () => dispatch(closeTool('changesets')),
          }),
    },
  ];

  return rows.filter((row) => row !== false);
}
