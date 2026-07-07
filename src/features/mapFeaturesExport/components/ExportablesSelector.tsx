import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { featureIdsEqual } from '@shared/types/featureId.js';
import type { ReactElement } from 'react';
import { ButtonGroup, ToggleButton } from 'react-bootstrap';
import type { IconType } from 'react-icons';
import {
  FaBullseye,
  FaCamera,
  FaDrawPolygon,
  FaFileImport,
  FaMapMarkerAlt,
  FaMapSigns,
  FaRoute,
  FaSearch,
} from 'react-icons/fa';
import { MdTimeline } from 'react-icons/md';
import { TbMapPins } from 'react-icons/tb';
import type { Exportable } from '../model/actions.js';
import { useMapFeaturesExportMessages } from '../translations/useMapFeaturesExportMessages.js';

// The selectable map-feature sources, in display order, with their icon and
// whether Garmin Connect can receive them.
export const exportableDefinitions: readonly [
  type: Exportable,
  Icon: IconType,
  garmin: boolean,
][] = [
  ['plannedRoute', FaRoute, true],
  ['objects', TbMapPins, false],
  ['pictures', FaCamera, false],
  ['drawingLines', MdTimeline, true],
  ['drawingAreas', FaDrawPolygon, false],
  ['drawingPoints', FaMapMarkerAlt, false],
  ['tracking', FaBullseye, true],
  ['import', FaFileImport, true],
  ['search', FaSearch, true],
];

// Which feature sources currently have data to export, encoded as the
// `|a|b|`-delimited string the export modals use for selection bookkeeping.
// Shared so the data export and the raster map export agree on availability.
export function useAvailableExportables(): string {
  return useAppSelector((state) => {
    const exportables: Exportable[] = [];

    if (state.search.selectedResult) {
      exportables.push('search');
    }

    if (state.routePlanner.alternatives.length) {
      exportables.push('plannedRoute');
    }

    if (state.objects.objects.length) {
      exportables.push('objects');
    }

    if (state.map.layers.includes('I')) {
      exportables.push('pictures');
    }

    if (state.drawingLines.lines.some((line) => line.type === 'line')) {
      exportables.push('drawingLines');
    }

    if (state.drawingLines.lines.some((line) => line.type === 'polygon')) {
      exportables.push('drawingAreas');
    }

    if (state.drawingPoints.points.length) {
      exportables.push('drawingPoints');
    }

    if (state.tracking.tracks.length) {
      exportables.push('tracking');
    }

    if (state.trackViewer.trackGeojson) {
      exportables.push('import');
    }

    return `|${exportables.map((e) => `${e}|`).join('')}`;
  });
}

// Maps the currently-selected map feature to the single exportable that can
// export just it, or null when nothing is selected (or the selection has no
// data to export). Drives the modal's "only selected item" toggle.
export function useSelectedExportable(): Exportable | null {
  return useAppSelector((state): Exportable | null => {
    const selection = state.main.selection;

    if (!selection) {
      return null;
    }

    switch (selection.type) {
      case 'draw-points':
        return state.drawingPoints.points[selection.id]
          ? 'drawingPoints'
          : null;

      case 'draw-line-poly':
      case 'line-point': {
        const index =
          selection.type === 'draw-line-poly'
            ? selection.id
            : selection.lineIndex;

        const line = state.drawingLines.lines[index];

        return line
          ? line.type === 'polygon'
            ? 'drawingAreas'
            : 'drawingLines'
          : null;
      }

      case 'objects':
        return state.objects.objects.some((o) =>
          featureIdsEqual(o.id, selection.id),
        )
          ? 'objects'
          : null;

      case 'tracking':
        // Only offer the toggle when the selected token actually resolves to a
        // track; a device picked in the settings form (a numeric device id, not
        // a track token) wouldn't narrow to anything.
        return state.tracking.tracks.some(
          (t) => String(t.token) === String(selection.id),
        )
          ? 'tracking'
          : null;

      case 'route-point':
      case 'route-leg':
        return state.routePlanner.alternatives.length ? 'plannedRoute' : null;

      case 'search':
        return state.search.selectedResult ? 'search' : null;

      default:
        return null;
    }
  });
}

type Props = {
  /** Current selection as a `|a|b|`-delimited string. */
  value: string;
  /** Available (selectable) sources as a `|a|b|`-delimited string. */
  available: string;
  onChange: (next: string) => void;
};

// The checkbox group of map-feature sources shared by the data export modal and
// the raster map export modal — the wrapping flex row plus every toggle button
// (incl. the connected "found route + with stops" pair).
export function ExportablesSelector({
  value,
  available,
  onChange,
}: Props): ReactElement {
  const em = useMapFeaturesExportMessages();

  const toggle = (type: Exportable) => {
    let next = value;

    if (value.includes(`|${type}|`)) {
      next = value.replace(`${type}|`, '');

      if (type === 'plannedRoute') {
        next = next.replace('|plannedRouteWithStops', '');
      }
    } else {
      next += `${type}|`;
    }

    onChange(next);
  };

  return (
    <div className="d-flex flex-wrap gap-2">
      {exportableDefinitions.map(([type, Icon]) =>
        type === 'plannedRoute' ? (
          // "found route" and its "include stops" modifier stay a connected
          // segmented pair among the detached pills
          <ButtonGroup key={type}>
            <ToggleButton
              id={`chk-${type}`}
              type="checkbox"
              variant="outline-primary"
              value={type}
              checked={value.includes(`|${type}|`)}
              disabled={!available.includes(`|${type}|`)}
              onChange={() => toggle(type)}
            >
              <Icon /> {em?.what[type]}
            </ToggleButton>

            <ToggleButton
              id="chk-plannedRouteWithStops"
              type="checkbox"
              variant="outline-primary"
              value="plannedRouteWithStops"
              checked={value.includes('|plannedRouteWithStops|')}
              disabled={!value.includes(`|${type}|`)}
              onChange={() => toggle('plannedRouteWithStops')}
            >
              <FaMapSigns /> {em?.what['plannedRouteWithStops']}
            </ToggleButton>
          </ButtonGroup>
        ) : (
          <ToggleButton
            key={type}
            id={`chk-${type}`}
            type="checkbox"
            variant="outline-primary"
            value={type}
            checked={value.includes(`|${type}|`)}
            disabled={!available.includes(`|${type}|`)}
            onChange={() => toggle(type)}
          >
            <Icon /> {em?.what[type]}
          </ToggleButton>
        ),
      )}
    </div>
  );
}
