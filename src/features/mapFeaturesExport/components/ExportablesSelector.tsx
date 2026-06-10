import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { ReactElement, ReactNode } from 'react';
import { ButtonGroup, ToggleButton } from 'react-bootstrap';
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
  icon: ReactNode,
  garmin: boolean,
][] = [
  ['plannedRoute', <FaRoute />, true],
  ['objects', <TbMapPins />, false],
  ['pictures', <FaCamera />, false],
  ['drawingLines', <MdTimeline />, true],
  ['drawingAreas', <FaDrawPolygon />, false],
  ['drawingPoints', <FaMapMarkerAlt />, false],
  ['tracking', <FaBullseye />, true],
  ['import', <FaFileImport />, true],
  ['search', <FaSearch />, true],
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

    if (state.trackViewer.trackGpx || state.trackViewer.trackGeojson) {
      exportables.push('import');
    }

    return '|' + exportables.map((e) => e + '|').join('');
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

    if (value.includes('|' + type + '|')) {
      next = value.replace(type + '|', '');

      if (type === 'plannedRoute') {
        next = next.replace('|plannedRouteWithStops', '');
      }
    } else {
      next += type + '|';
    }

    onChange(next);
  };

  return (
    <div className="d-flex flex-wrap gap-2">
      {exportableDefinitions.map(([type, icon]) =>
        type === 'plannedRoute' ? (
          // "found route" and its "include stops" modifier stay a connected
          // segmented pair among the detached pills
          <ButtonGroup key={type}>
            <ToggleButton
              id={'chk-' + type}
              type="checkbox"
              variant="outline-primary"
              value={type}
              checked={value.includes('|' + type + '|')}
              disabled={!available.includes('|' + type + '|')}
              onChange={() => toggle(type)}
            >
              {icon} {em?.what[type]}
            </ToggleButton>

            <ToggleButton
              id="chk-plannedRouteWithStops"
              type="checkbox"
              variant="outline-primary"
              value="plannedRouteWithStops"
              checked={value.includes('|plannedRouteWithStops|')}
              disabled={!value.includes('|' + type + '|')}
              onChange={() => toggle('plannedRouteWithStops')}
            >
              <FaMapSigns /> {em?.what['plannedRouteWithStops']}
            </ToggleButton>
          </ButtonGroup>
        ) : (
          <ToggleButton
            key={type}
            id={'chk-' + type}
            type="checkbox"
            variant="outline-primary"
            value={type}
            checked={value.includes('|' + type + '|')}
            disabled={!available.includes('|' + type + '|')}
            onChange={() => toggle(type)}
          >
            {icon} {em?.what[type]}
          </ToggleButton>
        ),
      )}
    </div>
  );
}
