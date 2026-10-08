import { type Selection, selectFeature } from '@app/store/actions.js';
import { interpolateLabel } from '@features/drawing/interpolateLabel.js';
import {
  drawingLineLabel,
  drawingPointLabel,
  lineLabelValues,
  pointLabelValues,
} from '@features/drawing/labelValues.js';
import { drawingMeasure } from '@features/drawing/model/actions/drawingPointActions.js';
import { fitMapToBbox } from '@features/map/fitMapToBbox.js';
import type { Leg } from '@features/routePlanner/model/actions.js';
import { tolledMeters } from '@features/routePlanner/model/pathDetails.js';
import { useRoutePlannerMessages } from '@features/routePlanner/translations/useRoutePlannerMessages.js';
import { searchSelectResult } from '@features/search/model/actions.js';
import {
  getGenericNameFromOsmElementSync,
  getNameFromOsmElement,
  getOsmMapping,
  resolveGenericName,
} from '@osm/osmNameResolver.js';
import { osmTagToIconMapping } from '@osm/osmTagToIconMapping.js';
import type { OsmMapping } from '@osm/types.js';
import type { UnknownAction } from '@reduxjs/toolkit';
import { IconGlyph } from '@shared/components/IconGlyph.js';
import { TruncatedText } from '@shared/components/TruncatedText.js';
import { formatDistance } from '@shared/distanceFormatter.js';
import { formatDuration } from '@shared/durationFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEffectiveChosenLanguage } from '@shared/hooks/useEffectiveChosenLanguage.js';
import { transportTypeDefs } from '@shared/transportTypeDefs.js';
import type { LatLon } from '@shared/types/common.js';
import {
  featureIdsEqual,
  stringifyFeatureId,
} from '@shared/types/featureId.js';
import { bbox as turfBbox } from '@turf/bbox';
import clsx from 'clsx';
import type { Geometry } from 'geojson';
import { type ReactElement, type ReactNode, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import {
  FaBullseye,
  FaDrawPolygon,
  FaLongArrowAltRight,
  FaMapMarkerAlt,
  FaPlay,
  FaSearch,
  FaStop,
} from 'react-icons/fa';
import { MdPolyline } from 'react-icons/md';
import { TbMapPin } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { isWideScreen, useMapLayersPanel } from '../mapLayersPanelStore.js';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';
import classes from './MapLayersPanel.module.css';

type Bbox = [number, number, number, number];

type Item = {
  key: string;
  icon: ReactElement;
  /** Its colour on the map, where it has one of its own. */
  color?: string | null;
  /** Also what the filter matches. */
  label: string;
  /** Shown in place of `label`, where plain text won't do. */
  display?: ReactNode;
  /** Shown muted, as what the item is where it has no label. */
  muted?: boolean;
  /** What kind of thing it is, muted after its name. */
  detail?: string;
  /** Figures worth not cutting off, on a line of their own under the name. */
  subline?: ReactNode;
  selected: boolean;
  /** What selecting it on the map dispatches. */
  actions: UnknownAction[];
  bbox?: Bbox;
};

// A filter box from this many items on.
const FILTER_FROM = 10;

function latLonBbox(points: readonly LatLon[]): Bbox | undefined {
  if (points.length === 0) {
    return undefined;
  }

  const lats = points.map((p) => p.lat);

  const lons = points.map((p) => p.lon);

  return [
    Math.min(...lons),
    Math.min(...lats),
    Math.max(...lons),
    Math.max(...lats),
  ];
}

function geometryBbox(geometry: Geometry | null | undefined): Bbox | undefined {
  if (!geometry) {
    return undefined;
  }

  const [w, s, e, n] = turfBbox(geometry);

  return [w, s, e, n];
}

function isSelected(
  selection: Selection | null,
  type: Selection['type'],
  id: unknown,
): boolean {
  return selection?.type === type && 'id' in selection && selection.id === id;
}

/** The items of one of the tools' features, each selected on the map by a tap. */
export function MapFeatureItems({ feature }: { feature: string }): ReactNode {
  switch (feature) {
    case 'search':
      return <SearchItems />;

    case 'objects':
      return <ObjectItems />;

    case 'tracking':
      return <TrackingItems />;

    case 'data':
      return <DataItems />;

    case 'route':
      return <RouteItems />;

    case 'drawing':
      return <DrawingItems />;

    default:
      return null;
  }
}

function ItemList({
  items,
  footer,
}: {
  items: Item[];
  /** Under the list, about the feature as a whole. */
  footer?: ReactNode;
}): ReactElement {
  const msm = useMapSettingsMessages();

  const dispatch = useDispatch();

  const zoom = useAppSelector((state) => state.map.zoom);

  const { setOpen } = useMapLayersPanel();

  const [filter, setFilter] = useState('');

  const query = filter.trim().toLocaleLowerCase();

  const shown = query
    ? items.filter((item) =>
        `${item.label} ${item.detail ?? ''}`
          .toLocaleLowerCase()
          .includes(query),
      )
    : items;

  const pick = (item: Item) => {
    for (const action of item.actions) {
      dispatch(action);
    }

    // Into view without zooming in; out only where it would not fit.
    if (item.bbox) {
      fitMapToBbox(dispatch, item.bbox, { maxZoom: zoom, padding: 40 });
    }

    // On a phone the panel covers what was just selected.
    if (!isWideScreen()) {
      setOpen(false);
    }
  };

  return (
    <>
      {items.length >= FILTER_FROM && (
        <Form.Control
          type="search"
          size="sm"
          className="mb-1"
          placeholder={msm?.filterItems}
          value={filter}
          onChange={(e) => setFilter(e.currentTarget.value)}
        />
      )}

      {shown.map((item) => (
        <div
          key={item.key}
          className={clsx(
            classes.row,
            item.selected && classes.rowSelected,
            'mx-n2 px-3',
          )}
        >
          <button
            type="button"
            className={clsx(
              classes.rowToggle,
              'w-100 d-flex align-items-center gap-1 text-start',
            )}
            onClick={() => pick(item)}
          >
            <span
              className="d-inline-flex flex-shrink-0"
              style={item.color ? { color: item.color } : undefined}
            >
              {item.icon}
            </span>

            <span className="d-flex flex-column min-w-0">
              <TruncatedText className={clsx(item.muted && 'text-muted')}>
                {item.display ?? item.label}

                {item.detail && (
                  <span className="text-muted"> · {item.detail}</span>
                )}
              </TruncatedText>

              {item.subline && (
                <TruncatedText className="small text-muted">
                  {item.subline}
                </TruncatedText>
              )}
            </span>
          </button>
        </div>
      ))}

      {/* Objects keep their row while the filter is on, whatever is in view. */}
      {items.length === 0 && (
        <p className="text-muted mt-1 mb-0">{msm?.nothingInView}</p>
      )}

      {footer}
    </>
  );
}

function SearchItems(): ReactElement {
  const results = useAppSelector((state) => state.search.selectedResults);

  const previewId = useAppSelector((state) => state.search.previewId);

  const selection = useAppSelector((state) => state.main.selection);

  const language = useEffectiveChosenLanguage();

  const mapping = useOsmMapping(language);

  return (
    <ItemList
      items={results
        .filter(
          (result) => !previewId || !featureIdsEqual(result.id, previewId),
        )
        .map((result) => {
          // An element loaded by its id carries only its tags.
          const osm = osmNaming(
            (result.geojson.properties ?? {}) as Record<string, string>,
            result.id.type === 'osm' ? result.id.elementType : undefined,
            language,
            mapping,
          );

          const name = result.displayName || osm.name;

          const generic = result.genericName || osm.generic;

          return {
            key: stringifyFeatureId(result.id),
            icon: osm.icon || <FaSearch />,
            label: name || generic || stringifyFeatureId(result.id),
            detail: name ? generic : undefined,
            muted: !name && !generic,
            selected:
              selection?.type === 'search' &&
              featureIdsEqual(selection.id, result.id),
            actions: [
              searchSelectResult({ result, focus: false, tier: 'keep' }),
            ],
            bbox: result.loading
              ? undefined
              : geometryBbox(
                  result.geojson.type === 'Feature'
                    ? result.geojson.geometry
                    : {
                        type: 'GeometryCollection',
                        geometries: result.geojson.features.flatMap((f) =>
                          f.geometry ? [f.geometry] : [],
                        ),
                      },
                ),
          };
        })}
    />
  );
}

/** The OSM tag names for the UI language, once loaded. */
function useOsmMapping(language: string): OsmMapping | undefined {
  const [mapping, setMapping] = useState<OsmMapping>();

  useEffect(() => {
    let current = true;

    getOsmMapping(language).then((mapping) => {
      if (current) {
        setMapping(mapping);
      }
    });

    return () => {
      current = false;
    };
  }, [language]);

  return mapping;
}

/** An OSM element's icon, name and kind, as its marker and tooltip show them. */
function osmNaming(
  tags: Record<string, string>,
  elementType: 'node' | 'way' | 'relation' | undefined,
  language: string,
  mapping: OsmMapping | undefined,
) {
  const poi = resolveGenericName(osmTagToIconMapping, tags)[0];

  return {
    icon: poi && <IconGlyph poi={poi} />,
    name: getNameFromOsmElement(tags, language),
    generic:
      mapping && elementType
        ? getGenericNameFromOsmElementSync(
            tags,
            elementType,
            mapping.osmTagToNameMapping,
            mapping.colorNames,
          )
        : '',
  };
}

function ObjectItems(): ReactElement {
  const objects = useAppSelector((state) => state.objects.objects);

  const language = useEffectiveChosenLanguage();

  const selection = useAppSelector((state) => state.main.selection);

  const mapping = useOsmMapping(language);

  const collator = new Intl.Collator(language);

  return (
    <ItemList
      items={objects
        .map(({ id, coords, tags }) => {
          const { icon, name, generic } = osmNaming(
            tags,
            id.elementType,
            language,
            mapping,
          );

          // As the marker's tooltip: the name, then the kind of thing.
          return {
            key: stringifyFeatureId(id),
            icon: icon || <TbMapPin />,
            label: name || generic || stringifyFeatureId(id),
            detail: name ? generic : undefined,
            muted: !name,
            selected:
              selection?.type === 'objects' &&
              featureIdsEqual(selection.id, id),
            actions: [selectFeature({ type: 'objects', id })],
            bbox: latLonBbox([coords]),
          };
        })
        // By name, the unnamed after them by kind; not by distance, as picking
        // one pans the map and would reorder the list under the finger.
        .sort(
          (a, b) =>
            Number(a.muted) - Number(b.muted) ||
            collator.compare(a.label, b.label),
        )}
    />
  );
}

function TrackingItems(): ReactElement {
  const devices = useAppSelector((state) => state.tracking.trackedDevices);

  const tracks = useAppSelector((state) => state.tracking.tracks);

  const selection = useAppSelector((state) => state.main.selection);

  return (
    <ItemList
      items={devices.map((device) => {
        const last = tracks
          .find((track) => track.token === device.token)
          ?.trackPoints.at(-1);

        return {
          key: device.token,
          icon: <FaBullseye />,
          color: device.color,
          label: device.label || device.token,
          muted: !device.label,
          selected: isSelected(selection, 'tracking', device.token),
          actions: [selectFeature({ type: 'tracking', id: device.token })],
          bbox: last && latLonBbox([last]),
        };
      })}
    />
  );
}

function DataItems(): ReactElement {
  const features = useAppSelector(
    (state) => state.trackViewer.trackGeojson?.features,
  );

  const selection = useAppSelector((state) => state.main.selection);

  return (
    <ItemList
      items={(features ?? []).map((feature, index) => {
        const name = feature.properties?.['name'];

        const type = feature.geometry?.type;

        return {
          key: String(index),
          icon:
            type === 'Point' || type === 'MultiPoint' ? (
              <FaMapMarkerAlt />
            ) : type === 'Polygon' || type === 'MultiPolygon' ? (
              <FaDrawPolygon />
            ) : (
              <MdPolyline />
            ),
          label: typeof name === 'string' && name ? name : `#${index + 1}`,
          muted: typeof name !== 'string' || !name,
          selected: isSelected(selection, 'data-viewer', index),
          actions: [selectFeature({ type: 'data-viewer', id: index })],
          bbox: geometryBbox(feature.geometry),
        };
      })}
    />
  );
}

function RouteItems(): ReactElement {
  const points = useAppSelector((state) => state.routePlanner.points);

  const alternative = useAppSelector(
    (state) =>
      state.routePlanner.alternatives[
        state.routePlanner.activeAlternativeIndex
      ],
  );

  const mode = useAppSelector((state) => state.routePlanner.mode);

  const finishOnly = useAppSelector((state) => state.routePlanner.finishOnly);

  const waypoints = useAppSelector((state) => state.routePlanner.waypoints);

  const transportType = useAppSelector(
    (state) => state.routePlanner.transportType,
  );

  const language = useAppSelector((state) => state.l10n.language);

  const selection = useAppSelector((state) => state.main.selection);

  const rpm = useRoutePlannerMessages();

  const last = points.length - 1;

  // Named as the markers are.
  const name = (index: number) =>
    (index === 0
      ? rpm?.start
      : index === last && mode !== 'roundtrip'
        ? rpm?.finish
        : rpm?.midpoint({
            n:
              mode === 'route'
                ? index
                : (waypoints[index]?.waypoint_index ?? index),
          })) ?? '…';

  // The points in the order the legs visit them; a round trip returns to the first.
  const visits =
    mode === 'route'
      ? points.map((_, index) => index)
      : points
          .map((_, index) => index)
          .sort(
            (a, b) =>
              (waypoints[a]?.waypoint_index ?? a) -
              (waypoints[b]?.waypoint_index ?? b),
          );

  const visited = (leg: number) => visits[leg % visits.length] ?? 0;

  // A leg's own transport is its start point's, and only a plain route has them.
  const legTransport = (index: number) =>
    (mode === 'route' && points[index]?.transport) || transportType;

  const tolled = tolledMeters(alternative);

  const legs = alternative?.legs ?? [];

  const figures = (distance: number, duration: number) =>
    [
      formatDistance(distance, language),
      duration > 0 && formatDuration(duration, language),
    ]
      .filter(Boolean)
      .join(' · ');

  // The whole route, as the marker that ends it says it.
  const totals = alternative && (
    <>
      {figures(alternative.distance, alternative.duration)}

      {tolled > 0 && (
        <div>{rpm?.tolled({ value: formatDistance(tolled, language) })}</div>
      )}
    </>
  );

  const pointItem = (index: number, reached: number): Item => {
    const isFinish = index === last && mode !== 'roundtrip';

    const before = legs.slice(0, reached);

    return {
      key: `point-${index}`,
      icon:
        index === 0 && !finishOnly ? (
          <FaPlay color="#409a40" />
        ) : isFinish ? (
          <FaStop color="#d9534f" />
        ) : (
          <FaMapMarkerAlt color="#3e64d5" />
        ),
      label: name(index),
      // How far it is from the start, as its marker's tooltip says.
      subline: isFinish
        ? totals
        : reached > 0 && before.length === reached
          ? figures(
              before.reduce((sum, leg) => sum + leg.distance, 0),
              before.reduce((sum, leg) => sum + leg.duration, 0),
            )
          : undefined,
      selected: isSelected(selection, 'route-point', index),
      actions: [selectFeature({ type: 'route-point', id: index })],
      bbox: latLonBbox([points[index]!]),
    };
  };

  const legItem = (index: number, leg: Leg): Item => ({
    key: `leg-${index}`,
    icon: transportTypeDefs[legTransport(visited(index))].icon,
    label: `${name(visited(index))} → ${name(visited(index + 1))}`,
    display: (
      <>
        {name(visited(index))}
        <FaLongArrowAltRight className="text-muted mx-1" />
        {name(visited(index + 1))}
      </>
    ),
    subline: figures(leg.distance, leg.duration),
    selected: isSelected(selection, 'route-leg', index),
    actions: [selectFeature({ type: 'route-leg', id: index })],
    bbox: latLonBbox(
      leg.steps.flatMap((step) =>
        step.geometry.coordinates.map(([lon, lat]) => ({
          lat: lat!,
          lon: lon!,
        })),
      ),
    ),
  });

  return (
    <ItemList
      // A round trip ends back at its start, with no finish to carry them.
      footer={
        mode === 'roundtrip' &&
        totals && <div className="small text-muted mt-2">{totals}</div>
      }
      items={visits.flatMap((index, at) => {
        const leg = legs[at];

        return [pointItem(index, at), ...(leg ? [legItem(at, leg)] : [])];
      })}
    />
  );
}

function DrawingItems(): ReactElement {
  const points = useAppSelector((state) => state.drawingPoints.points);

  const lines = useAppSelector((state) => state.drawingLines.lines);

  const selection = useAppSelector((state) => state.main.selection);

  // What an unlabelled item is told apart by: where it is, or its size.
  const measure = (
    template: string,
    values: Record<string, string | undefined>,
  ) => interpolateLabel(template, values).replace(/\s+/g, ' ');

  return (
    <ItemList
      items={[
        ...lines.flatMap((line, index) => {
          // A hole is part of its polygon, selected with it.
          if (line.holeOfId !== undefined) {
            return [];
          }

          const label = line.label ? drawingLineLabel(line, lines).trim() : '';

          return [
            {
              key: `line-${line.id}`,
              icon:
                line.type === 'polygon' ? <FaDrawPolygon /> : <MdPolyline />,
              color: line.color,
              label:
                label ||
                measure(
                  line.type === 'polygon' ? '{area}' : '{length}',
                  lineLabelValues(line, lines),
                ),
              muted: !label,
              selected: isSelected(selection, 'draw-line-poly', index),
              actions: [
                selectFeature({ type: 'draw-line-poly', id: index }),
                drawingMeasure({}),
              ],
              bbox: latLonBbox(line.points),
            },
          ];
        }),
        ...points.map((point, index) => {
          const label = point.label ? drawingPointLabel(point).trim() : '';

          return {
            key: `point-${index}`,
            icon: <FaMapMarkerAlt />,
            color: point.color,
            label: label || measure('{location}', pointLabelValues(point)),
            muted: !label,
            selected: isSelected(selection, 'draw-points', index),
            actions: [
              selectFeature({ type: 'draw-points', id: index }),
              drawingMeasure({}),
            ],
            bbox: latLonBbox([point.coords]),
          };
        }),
      ]}
    />
  );
}
