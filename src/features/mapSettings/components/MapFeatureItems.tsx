import { type Selection, selectFeature } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { changesetDetail } from '@features/changesets/model/changesetDetail.js';
import { interpolateLabel } from '@features/drawing/interpolateLabel.js';
import {
  lineLabelValues,
  pointLabelValues,
} from '@features/drawing/labelValues.js';
import type { DrawnLine } from '@features/drawing/model/actions/drawingLineActions.js';
import { drawingMeasure } from '@features/drawing/model/actions/drawingPointActions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapSetFeaturesHidden } from '@features/map/model/actions.js';
import {
  fitOnceSettled,
  fitToUncovered,
  GENEROUS_MARGIN_PX,
} from '@features/map/panToUncovered.js';
import { legTransports } from '@features/routePlanner/model/legTransports.js';
import { tolledMeters } from '@features/routePlanner/model/pathDetails.js';
import {
  stopNumber,
  WAYPOINT_COLORS,
  waypointKind,
} from '@features/routePlanner/model/routeColors.js';
import { useRoutePlannerMessages } from '@features/routePlanner/translations/useRoutePlannerMessages.js';
import {
  type SearchSource,
  searchSelectResult,
} from '@features/search/model/actions.js';
import { hasGeometry } from '@features/search/model/resultUtils.js';
import { keptSearchResultsSelector } from '@features/search/model/selectors.js';
import { getNameFromOsmElement, getOsmName } from '@osm/osmNameResolver.js';
import { osmPoiKind } from '@osm/osmPoiKind.js';
import type { OsmMapping } from '@osm/types.js';
import { useOsmMapping } from '@osm/useOsmMapping.js';
import type { UnknownAction } from '@reduxjs/toolkit';
import { formatArea, naturalAreaUnit } from '@shared/areaFormatter.js';
import { splitColorAlpha } from '@shared/colorAlpha.js';
import { IconGlyph } from '@shared/components/IconGlyph.js';
import { TruncatedText } from '@shared/components/TruncatedText.js';
import { formatDistance } from '@shared/distanceFormatter.js';
import { formatDuration } from '@shared/durationFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useEffectiveChosenLanguage } from '@shared/hooks/useEffectiveChosenLanguage.js';
import {
  lineStyleFromProperties,
  pointStyleFromProperties,
} from '@shared/styleFromProperties.js';
import { transportTypeDefs } from '@shared/transportTypeDefs.js';
import type { LatLon } from '@shared/types/common.js';
import {
  featureIdsEqual,
  type OsmFeatureId,
  stringifyFeatureId,
} from '@shared/types/featureId.js';
import { area as turfArea } from '@turf/area';
import { bbox as turfBbox } from '@turf/bbox';
import { length as turfLength } from '@turf/length';
import clsx from 'clsx';
import type { GeoJSON } from 'geojson';
import { type ReactElement, type ReactNode, useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import {
  FaBullseye,
  FaDrawPolygon,
  FaLongArrowAltRight,
  FaMapMarkerAlt,
  FaPencilAlt,
  FaPlay,
  FaSearch,
  FaStop,
} from 'react-icons/fa';
import { MdPolyline } from 'react-icons/md';
import { TbMapPin } from 'react-icons/tb';
import { useDispatch, useStore } from 'react-redux';
import type { MapFeatureId } from '../mapFeatureCounts.js';
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
  /** The selection it is, highlighted while current, and made by a tap. */
  selects?: Selection;
  /** Dispatched by a tap instead, where selecting it on the map does more. */
  actions?: UnknownAction[];
  /** Worked out only when it is picked: a long line has many points. */
  bbox: () => Bbox | undefined;
};

// A filter box from this many items on.
const FILTER_FROM = 10;

const MAX_ROWS = 200;

// A loop: spreading a long track into `Math.min` overflows the stack.
function latLonBbox(points: Iterable<LatLon>): Bbox | undefined {
  let bbox: Bbox | undefined;

  for (const { lat, lon } of points) {
    bbox = bbox
      ? [
          Math.min(bbox[0], lon),
          Math.min(bbox[1], lat),
          Math.max(bbox[2], lon),
          Math.max(bbox[3], lat),
        ]
      : [lon, lat, lon, lat];
  }

  return bbox;
}

function geojsonBbox(geojson: GeoJSON | null | undefined): Bbox | undefined {
  if (!geojson) {
    return undefined;
  }

  const [w, s, e, n] = turfBbox(geojson);

  return [w, s, e, n];
}

function sameSelection(a: Selection | null, b: Selection): boolean {
  if (a?.type !== b.type || !('id' in a) || !('id' in b)) {
    return false;
  }

  return typeof a.id === 'object' && typeof b.id === 'object'
    ? featureIdsEqual(a.id, b.id)
    : a.id === b.id;
}

/** The items of one of the tools' features, each selected on the map by a tap. */
export function MapFeatureItems({
  feature,
}: {
  feature: MapFeatureId;
}): ReactElement {
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

    case 'changesets':
      return <ChangesetItems />;
  }
}

function ItemList({
  items,
  footer,
  empty,
}: {
  items: Item[];
  /** Under the list, about the feature as a whole. */
  footer?: ReactNode;
  /** Said where there are no items at all; most lists are never empty. */
  empty?: string;
}): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const dispatch = useDispatch();

  const store = useStore<RootState>();

  // Read here alone, so selecting doesn't rebuild every list's items.
  const selection = useAppSelector((state) => state.main.selection);

  const { setOpen } = useMapLayersPanel();

  const [filter, setFilter] = useState('');

  const filterable = items.length >= FILTER_FROM;

  // Not while its box is gone: it would narrow the list out of sight.
  const query = filterable ? filter.trim().toLocaleLowerCase() : '';

  const matching = query
    ? items.filter((item) =>
        `${item.label} ${item.detail ?? ''}`
          .toLocaleLowerCase()
          .includes(query),
      )
    : items;

  // Rendered rows are costly (a tooltip and an observer each); the filter
  // reaches the rest.
  const shown = matching.slice(0, MAX_ROWS);

  const pick = (item: Item) => {
    const { main, map } = store.getState();

    const before = main.selection?.type;

    // A picked item has to be drawn to be seen.
    if (map.featuresHidden) {
      dispatch(mapSetFeaturesHidden(false));
    }

    for (const action of item.actions ??
      (item.selects ? [selectFeature(item.selects)] : [])) {
      dispatch(action);
    }

    const bbox = item.bbox();

    // On a phone the panel covers what was just selected.
    const closing = !isWideScreen();

    if (closing) {
      setOpen(false);
    }

    if (!bbox) {
      return;
    }

    // Into the part of the map nothing covers, once a closing panel is gone;
    // not moved where it is in view already, zoomed out only to fit, and never
    // past the store's zoom, which may be ahead of an animating map.
    const bringIntoView = () =>
      void fitToUncovered(dispatch, bbox, {
        ifHidden: true,
        margin: closing ? undefined : GENEROUS_MARGIN_PX,
        maxZoom: store.getState().map.zoom,
      });

    // A selection of another kind brings up its toolbar, which may cover the
    // item: the fit measures once it is there.
    fitOnceSettled(
      bringIntoView,
      item.selects !== undefined && item.selects.type !== before,
    );
  };

  return (
    <>
      {filterable && (
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
            item.selects &&
              sameSelection(selection, item.selects) &&
              classes.rowSelected,
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
              <TruncatedText
                className={clsx(item.muted && 'text-muted')}
                // Muted grey is lost on the tooltip's dark background.
                tooltip={
                  item.detail ? `${item.label} · ${item.detail}` : undefined
                }
              >
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

      {matching.length > shown.length && (
        <p className="text-muted mt-1 mb-0">
          +{matching.length - shown.length}
        </p>
      )}

      {(items.length === 0 ? empty : shown.length === 0) && (
        <p className="text-muted mt-1 mb-0">
          {items.length === 0 ? empty : m?.search.noResults}
        </p>
      )}

      {footer}
    </>
  );
}

function osmKind(
  id: OsmFeatureId | undefined,
  tags: Record<string, string>,
  mapping: OsmMapping | undefined,
) {
  const { poi, generic } = osmPoiKind(tags, id?.elementType, mapping);

  return { icon: poi ? <IconGlyph poi={poi} /> : undefined, generic };
}

/** Name · kind, as a tooltip reads; the kind alone, muted, where unnamed. */
function nameAndKind(
  name: string,
  generic: string | undefined,
  fallback: string,
): Pick<Item, 'label' | 'detail' | 'muted'> {
  return {
    label: name || generic || fallback,
    detail: name ? generic : undefined,
    muted: !name,
  };
}

// Sources whose result is named by the kind of lookup, as on the map.
const SOURCE_NAMED = new Set<SearchSource>([
  'bbox',
  'coords',
  'tile',
  'geojson',
]);

function SearchItems(): ReactElement {
  const m = useMessages();

  const results = useAppSelector(keptSearchResultsSelector);

  const language = useEffectiveChosenLanguage();

  const mapping = useOsmMapping(language);

  return (
    <ItemList
      items={results.map((result) => {
        // An element loaded by its id carries only its tags.
        const tags = (result.geojson.properties ?? {}) as Record<
          string,
          string
        >;

        const osm = osmKind(
          result.id.type === 'osm' ? result.id : undefined,
          tags,
          mapping,
        );

        const generic =
          result.genericName ||
          osm.generic ||
          (SOURCE_NAMED.has(result.source)
            ? m?.search.sources[result.source as 'bbox']
            : undefined);

        return {
          ...nameAndKind(
            result.displayName || getOsmName(tags, language),
            generic,
            stringifyFeatureId(result.id),
          ),
          key: stringifyFeatureId(result.id),
          icon: osm.icon ?? <FaSearch />,
          selects: { type: 'search', id: result.id },
          actions: [searchSelectResult({ result, focus: false, tier: 'keep' })],
          bbox: () =>
            result.loading || !hasGeometry(result)
              ? undefined
              : geojsonBbox(result.geojson),
        };
      })}
    />
  );
}

function ObjectItems(): ReactElement {
  const objects = useAppSelector((state) => state.objects.objects);

  const language = useEffectiveChosenLanguage();

  const mapping = useOsmMapping(language);

  const msm = useMapSettingsMessages();

  const collator = new Intl.Collator(language);

  return (
    <ItemList
      // The row stays while the category filter is on, whatever is in view.
      empty={msm?.nothingInView}
      items={objects
        .map(({ id, coords, tags }): Item => {
          const osm = osmKind(id, tags, mapping);

          return {
            ...nameAndKind(
              getNameFromOsmElement(tags, language),
              osm.generic,
              stringifyFeatureId(id),
            ),
            key: stringifyFeatureId(id),
            icon: osm.icon ?? <TbMapPin />,
            selects: { type: 'objects', id },
            bbox: () => latLonBbox([coords]),
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

  // Read on a pick only: the tracks grow with every live point.
  const store = useStore<RootState>();

  return (
    <ItemList
      items={devices.map((device) => ({
        key: device.token,
        icon: <FaBullseye />,
        color: device.color,
        label: device.label || device.token,
        muted: !device.label,
        selects: { type: 'tracking', id: device.token },
        bbox: () => {
          const last = store
            .getState()
            .tracking.tracks.find((track) => track.token === device.token)
            ?.trackPoints.at(-1);

          return last && latLonBbox([last]);
        },
      }))}
    />
  );
}

function DataItems(): ReactElement {
  const features = useAppSelector(
    (state) => state.trackViewer.trackGeojson?.features,
  );

  const defaultStyle = useAppSelector(
    (state) => state.trackViewerSettings.style,
  );

  const language = useAppSelector((state) => state.l10n.language);

  // Once per loaded file: a recorded track can have tens of thousands of points.
  const sizes = useMemo(
    () =>
      (features ?? []).map((feature) => {
        const type = feature.geometry?.type;

        if (type === 'Polygon' || type === 'MultiPolygon') {
          const m2 = turfArea(feature);

          return formatArea(m2, naturalAreaUnit(m2), language);
        }

        return type === 'LineString' || type === 'MultiLineString'
          ? formatDistance(turfLength(feature, { units: 'meters' }), language)
          : undefined;
      }),
    [features, language],
  );

  return (
    <ItemList
      items={(features ?? []).map((feature, index) => {
        const rawName = feature.properties?.['name'];

        const name = typeof rawName === 'string' ? rawName : '';

        const type = feature.geometry?.type;

        const point = type === 'Point' || type === 'MultiPoint';

        const polygon = type === 'Polygon' || type === 'MultiPolygon';

        const size = sizes[index];

        return {
          key: String(index),
          icon: point ? (
            <FaMapMarkerAlt />
          ) : polygon ? (
            <FaDrawPolygon />
          ) : (
            <MdPolyline />
          ),
          // As it is drawn: its own style, else the track viewer's default.
          color: splitColorAlpha(
            (point
              ? pointStyleFromProperties(feature.properties).color
              : lineStyleFromProperties(feature.properties, polygon).color) ??
              defaultStyle.color,
          ).color,
          label: name || size || `#${index + 1}`,
          subline: name ? size : undefined,
          muted: !name,
          selects: { type: 'data-viewer', id: index },
          bbox: () => geojsonBbox(feature.geometry),
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

  const rpm = useRoutePlannerMessages();

  const legs = alternative?.legs ?? [];

  const kind = (index: number) =>
    waypointKind(index, points.length, finishOnly, mode);

  // Its marker's number: the router's visiting order where it reorders them.
  const order = (index: number) => stopNumber(index, mode, waypoints) ?? index;

  // Named by kind, as the icon and the marker are; a finish-only route's first
  // stop, which its marker leaves unnumbered, goes without a number too.
  const name = (index: number) => {
    const pointKind = kind(index);

    return (
      (pointKind === 'start'
        ? rpm?.start
        : pointKind === 'finish'
          ? rpm?.finish
          : rpm &&
            (finishOnly && index === 0
              ? rpm.stop
              : `${rpm.stop} ${order(index)}`)) ?? '…'
    );
  };

  // The points in the order the legs visit them; a round trip returns to the first.
  const visits = points
    .map((_, index) => index)
    .sort((a, b) => order(a) - order(b));

  const visited = (leg: number) => visits[leg % visits.length] ?? 0;

  // Only a plain route has a transport per leg.
  const transports =
    mode === 'route' ? legTransports(points, transportType) : [];

  const tolled = tolledMeters(alternative);

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

  const items: Item[] = [];

  let distance = 0;

  let duration = 0;

  for (const [at, index] of visits.entries()) {
    const pointKind = kind(index);

    items.push({
      key: `point-${index}`,
      icon:
        pointKind === 'start' ? (
          <FaPlay />
        ) : pointKind === 'finish' ? (
          <FaStop />
        ) : (
          <FaMapMarkerAlt />
        ),
      color: WAYPOINT_COLORS[pointKind],
      label: name(index),
      // How far it is from the start, as its marker's tooltip says.
      subline:
        pointKind === 'finish'
          ? totals
          : at > 0 && legs[at - 1]
            ? figures(distance, duration)
            : undefined,
      selects: { type: 'route-point', id: index },
      bbox: () => latLonBbox([points[index]!]),
    });

    const leg = legs[at];

    if (!leg) {
      continue;
    }

    distance += leg.distance;

    duration += leg.duration;

    const from = name(index);

    const to = name(visited(at + 1));

    items.push({
      key: `leg-${at}`,
      icon: transportTypeDefs[transports[index] ?? transportType].icon,
      label: `${from} → ${to}`,
      display: (
        <>
          {from}
          <FaLongArrowAltRight className="text-muted mx-1" />
          {to}
        </>
      ),
      subline: figures(leg.distance, leg.duration),
      selects: { type: 'route-leg', id: at },
      bbox: () =>
        latLonBbox(
          leg.steps.flatMap((step) =>
            step.geometry.coordinates.map(([lon, lat]) => ({
              lat: lat!,
              lon: lon!,
            })),
          ),
        ),
    });
  }

  return (
    <ItemList
      // A round trip ends back at its start, with no finish to carry them.
      footer={
        mode === 'roundtrip' &&
        totals && <div className="small text-muted mt-2">{totals}</div>
      }
      items={items}
    />
  );
}

/** An item's label, and its size or where it is: under the label, or in its place. */
function naming(
  label: string | undefined,
  measure: string,
  values: Record<string, string | undefined>,
) {
  const named = label ? interpolateLabel(label, values).trim() : '';

  const measured = interpolateLabel(measure, values).replace(/\s+/g, ' ');

  return { named, measured };
}

// By line: an unchanged line keeps its identity, so a drag re-measures only
// the line dragged.
const lineNamings = new WeakMap<
  DrawnLine,
  { language: string; named: string; measured: string }
>();

function DrawingItems(): ReactElement {
  const points = useAppSelector((state) => state.drawingPoints.points);

  const lines = useAppSelector((state) => state.drawingLines.lines);

  const language = useAppSelector((state) => state.l10n.language);

  // Polygons a hole changes the area of; the rest are measured by themselves.
  const withHoles = new Set(lines.flatMap((line) => line.holeOfId ?? []));

  const lineNaming = (line: DrawnLine) => {
    const cacheable = !withHoles.has(line.id);

    const cached = cacheable ? lineNamings.get(line) : undefined;

    if (cached?.language === language) {
      return cached;
    }

    const fresh = {
      language,
      ...naming(
        line.label,
        line.type === 'polygon' ? '{area}' : '{length}',
        lineLabelValues(line, lines),
      ),
    };

    // Never kept with a hole's area in: the hole can go while the polygon stays.
    if (cacheable) {
      lineNamings.set(line, fresh);
    }

    return fresh;
  };

  return (
    <ItemList
      items={[
        ...lines.flatMap((line, index): Item[] => {
          // A hole is part of its polygon, selected with it.
          if (line.holeOfId !== undefined) {
            return [];
          }

          const selects: Selection = { type: 'draw-line-poly', id: index };

          const { named, measured } = lineNaming(line);

          return [
            {
              key: `line-${line.id}`,
              icon:
                line.type === 'polygon' ? <FaDrawPolygon /> : <MdPolyline />,
              color: line.color,
              label: named || measured,
              subline: named ? measured : undefined,
              muted: !named,
              selects,
              actions: [selectFeature(selects), drawingMeasure({})],
              bbox: () => latLonBbox(line.points),
            },
          ];
        }),
        ...points.map((point, index): Item => {
          const selects: Selection = { type: 'draw-points', id: index };

          const values = pointLabelValues(point);

          const named = point.label
            ? interpolateLabel(point.label, values).trim()
            : '';

          return {
            key: `point-${index}`,
            icon: <FaMapMarkerAlt />,
            color: point.color,
            // Where it is, only where it has no label: a point shows nothing more.
            label:
              named ||
              interpolateLabel('{location}', values).replace(/\s+/g, ' '),
            muted: !named,
            selects,
            actions: [selectFeature(selects), drawingMeasure({})],
            bbox: () => latLonBbox([point.coords]),
          };
        }),
      ]}
    />
  );
}

function ChangesetItems(): ReactElement {
  const changesets = useAppSelector((state) => state.changesets.changesets);

  // As the detail the pick opens dates it.
  const dateFormat = useDateTimeFormat({
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Newest first; picked, one shows what its marker's click does.
  return (
    <ItemList
      items={changesets
        .toSorted((a, b) => b.closedAt.getTime() - a.closedAt.getTime())
        .map((changeset) => ({
          key: String(changeset.id),
          icon: <FaPencilAlt />,
          label: changeset.userName,
          detail: changeset.description || undefined,
          subline: dateFormat.format(changeset.closedAt),
          actions: [changesetDetail(changeset)],
          bbox: () =>
            latLonBbox([
              { lat: changeset.centerLat, lon: changeset.centerLon },
            ]),
        }))}
    />
  );
}
