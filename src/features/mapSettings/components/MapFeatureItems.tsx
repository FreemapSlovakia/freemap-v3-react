import { openTool, selectFeature } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { diffElementIcon } from '@features/changesets/components/ElementTypeIcon.js';
import { useElementName } from '@features/changesets/components/useElementName.js';
import {
  changesetsHover,
  changesetsInspect,
} from '@features/changesets/model/actions.js';
import {
  currentVersion,
  DIFF_ACTIONS,
  DIFF_COLORS,
  elementKey,
  listedElements,
  osmIdOf,
} from '@features/changesets/model/changesetDiff.js';
import { listedChangesetsSelector } from '@features/changesets/model/selectors.js';
import { useChangesetsMessages } from '@features/changesets/translations/useChangesetsMessages.js';
import { dataViewerSetListSort } from '@features/dataViewer/model/actions.js';
import { drawingMeasure } from '@features/drawing/model/actions/drawingPointActions.js';
import { selectRecorderLines } from '@features/gpsRecorder/model/selectors.js';
import { recorderLineLength } from '@features/gpsRecorder/segments.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
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
import { formatArea, naturalAreaUnit } from '@shared/areaFormatter.js';
import { splitColorAlpha } from '@shared/colorAlpha.js';
import { IconGlyph } from '@shared/components/IconGlyph.js';
import { formatDistance } from '@shared/distanceFormatter.js';
import { formatDuration } from '@shared/durationFormatter.js';
import { featureDataProps, featureLabel } from '@shared/featureProperties.js';
import { formatLocationLines } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useEffectiveChosenLanguage } from '@shared/hooks/useEffectiveChosenLanguage.js';
import {
  lineStyleFromProperties,
  pointStyleFromProperties,
} from '@shared/styleFromProperties.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { transportTypeDefs } from '@shared/transportTypeDefs.js';
import {
  type OsmFeatureId,
  stringifyFeatureId,
} from '@shared/types/featureId.js';
import { area as turfArea } from '@turf/area';
import { length as turfLength } from '@turf/length';
import { type ReactElement, useEffect, useMemo } from 'react';
import {
  FaBullseye,
  FaDrawPolygon,
  FaListOl,
  FaLongArrowAltRight,
  FaMapMarkerAlt,
  FaPencilAlt,
  FaPlay,
  FaRulerHorizontal,
  FaSearch,
  FaSortAlphaDown,
  FaStop,
  FaTag,
} from 'react-icons/fa';
import { MdPolyline } from 'react-icons/md';
import { TbMapPin } from 'react-icons/tb';
import { useDispatch, useStore } from 'react-redux';
import type { MapFeatureId } from '../mapFeatureCounts.js';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';
import {
  effectiveSort,
  geojsonBbox,
  type Item,
  ItemList,
  type ItemSortOption,
  latLonBbox,
} from './ItemList.js';

/** The items of one of the tools' features, each selected on the map by a tap. */
export function MapFeatureItems({
  feature,
  elements,
}: {
  feature: MapFeatureId;
  /** The inspected changeset's elements in place of the changesets. */
  elements?: boolean;
}): ReactElement {
  switch (feature) {
    case 'search':
      return <SearchItems />;

    case 'objects':
      return <ObjectItems />;

    case 'gps-recorder':
      return <RecorderItems />;

    case 'tracking':
      return <TrackingItems />;

    case 'data':
      return <DataItems />;

    case 'route':
      return <RouteItems />;

    case 'changesets':
      return elements ? <ChangesetElementItems /> : <ChangesetListItems />;
  }
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

function RecorderItems(): ReactElement {
  const lines = useAppSelector(selectRecorderLines);

  const style = useAppSelector((state) => state.gpsRecorderSettings.style);

  const language = useAppSelector((state) => state.l10n.language);

  const dateFormat = useDateTimeFormat({
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <ItemList
      items={lines.map((line) => {
        const first = line[0]!;

        const last = line.at(-1)!;

        return {
          key: String(first.seq),
          icon: <MdPolyline />,
          color: splitColorAlpha(style.color).color,
          label: dateFormat.format(first.ts),
          subline: [
            formatDistance(recorderLineLength(line), language),
            last.ts > first.ts &&
              formatDuration((last.ts - first.ts) / 1000, language),
          ]
            .filter(Boolean)
            .join(' · '),
          // It has no selection; its toolbar is what acts on it.
          actions: [openTool('gps-recorder')],
          bbox: () => latLonBbox(line),
        };
      })}
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

  const listSort = useAppSelector(
    (state) => state.trackViewerSettings.listSort,
  );

  const dispatch = useDispatch();

  const msm = useMapSettingsMessages();

  // Once per change: a recorded track can have tens of thousands of points. A
  // point shows where it is, having no size.
  const sizes = useMemo(
    () =>
      (features ?? []).map(
        (
          feature,
        ): { text?: string; length?: number; area?: number } | undefined => {
          const { geometry } = feature;

          const type = geometry?.type;

          if (type === 'Polygon' || type === 'MultiPolygon') {
            const area = turfArea(feature);

            return {
              text: formatArea(area, naturalAreaUnit(area), language),
              area,
            };
          }

          if (geometry?.type === 'Point') {
            const [lon, lat] = geometry.coordinates;

            return {
              text: formatLocationLines({ lat: lat!, lon: lon! }).replace(
                /\s+/g,
                ' ',
              ),
            };
          }

          if (type === 'LineString' || type === 'MultiLineString') {
            const length = turfLength(feature, { units: 'meters' });

            return { text: formatDistance(length, language), length };
          }

          return undefined;
        },
      ),
    [features, language],
  );

  const props = useMemo(
    () =>
      (features ?? []).map((feature) => featureDataProps(feature.properties)),
    [features],
  );

  const sortOptions = useMemo((): ItemSortOption[] => {
    // Only a property two features have can order anything.
    const counts = Map.groupBy(
      props.flatMap((p) => Object.keys(p)),
      (key) => key,
    );

    const keys = [...counts].flatMap(([key, all]) =>
      all.length > 1 ? [key] : [],
    );

    return [
      // No item has an `order` key, so they keep theirs.
      { id: 'order', label: msm?.sorts.order, icon: <FaListOl /> },
      { id: 'name', label: msm?.sorts.name, icon: <FaSortAlphaDown /> },
      ...(sizes.some((size) => size?.length !== undefined)
        ? [
            {
              id: 'length',
              label: msm?.sorts.longest,
              icon: <FaRulerHorizontal />,
              desc: true,
            },
          ]
        : []),
      ...(sizes.some((size) => size?.area !== undefined)
        ? [
            {
              id: 'area',
              label: msm?.sorts.largest,
              icon: <FaDrawPolygon />,
              desc: true,
            },
          ]
        : []),
      ...keys.toSorted().map((key, i) => ({
        id: `prop:${key}`,
        label: key,
        icon: <FaTag />,
        divided: i === 0,
      })),
    ];
  }, [props, sizes, msm]);

  const sortedBy = effectiveSort({ options: sortOptions, value: listSort });

  const sortedProp = sortedBy?.id.startsWith('prop:')
    ? sortedBy.id.slice('prop:'.length)
    : undefined;

  // Likewise, as a `{length}` label measures too.
  const names = useMemo(
    () =>
      (features ?? []).map(
        (feature) =>
          featureLabel(feature, { locale: language, singleLine: true }) ?? '',
      ),
    [features, language],
  );

  return (
    <ItemList
      onSearchStart={() =>
        trackMatomo(['trackEvent', 'DataViewer', 'listSearch'])
      }
      sort={{
        options: sortOptions,
        value: listSort,
        onChange: (id) => {
          trackMatomo([
            'trackEvent',
            'DataViewer',
            'listSort',
            id.startsWith('prop:') ? 'property' : id,
          ]);

          dispatch(dataViewerSetListSort(id));
        },
      }}
      items={(features ?? []).map((feature, index): Item => {
        const name = names[index]!;

        const type = feature.geometry?.type;

        const point = type === 'Point' || type === 'MultiPoint';

        const polygon = type === 'Polygon' || type === 'MultiPolygon';

        const { text: size, length, area } = sizes[index] ?? {};

        const data = props[index]!;

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
          // The property sorted by shows, as the events' sorted stat does.
          subline:
            [
              name && size,
              sortedProp !== undefined &&
                data[sortedProp] &&
                `${sortedProp}: ${data[sortedProp]}`,
            ]
              .filter(Boolean)
              .join(' · ') || undefined,
          muted: !name,
          search: Object.values(data).join(' '),
          sortKeys: {
            name: name || undefined,
            length,
            area,
            ...Object.fromEntries(
              Object.entries(data)
                .filter(([, value]) => value !== '')
                .map(([key, value]) => [`prop:${key}`, value]),
            ),
          },
          selects: { type: 'feature', id: index },
          actions: [
            selectFeature({ type: 'feature', id: index }),
            drawingMeasure({}),
          ],
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
        <div>
          <Text m={rpm}>
            {(rpm) => rpm.tolled({ value: formatDistance(tolled, language) })}
          </Text>
        </div>
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

function ChangesetElementItems(): ReactElement {
  const diff = useAppSelector(
    (state) => state.changesetInspector.inspected?.diff,
  );

  const language = useEffectiveChosenLanguage();

  const mapping = useOsmMapping(language);

  const cm = useChangesetsMessages();

  const { name, typeAndId } = useElementName();

  const inspectedId = useAppSelector(
    (state) => state.changesetInspector.inspected?.id,
  );

  return (
    <ItemList
      // Each changeset's list paged from its start, and filtered afresh.
      key={inspectedId}
      items={listedElements(diff ?? [])
        .toSorted(
          (a, b) =>
            DIFF_ACTIONS.indexOf(a.action) - DIFF_ACTIONS.indexOf(b.action),
        )
        .map((element): Item => {
          const { tags = {}, coords = [] } = currentVersion(element) ?? {};

          const key = elementKey(element);

          const Icon = diffElementIcon(element);

          const osm = osmKind(osmIdOf(element), tags, mapping);

          return {
            ...nameAndKind(
              name(element) ?? '',
              osm.generic,
              typeAndId(element),
            ),
            key,
            icon: osm.icon ?? <Icon />,
            color: DIFF_COLORS[element.action],
            // The kind of element, which a POI icon doesn't tell; no tooltip,
            // as rows are costly and the row itself is the button.
            subline: (
              <>
                <Icon /> <Text m={cm} k={`actions.${element.action}`} />
              </>
            ),
            selects: { type: 'changeset-element', id: key },
            bbox: () => latLonBbox(coords.map(([lat, lon]) => ({ lat, lon }))),
          };
        })}
    />
  );
}

function ChangesetListItems(): ReactElement {
  const changesets = useAppSelector(listedChangesetsSelector);

  const inspectedId = useAppSelector(
    (state) => state.changesetInspector.inspected?.id,
  );

  const dispatch = useDispatch();

  const store = useStore<RootState>();

  // A list gone from under the pointer (the panel closed or moved on) leaves
  // no mouseleave, so takes its outline along.
  useEffect(
    () => () => {
      if (store.getState().changesets.hovered !== null) {
        dispatch(changesetsHover(null));
      }
    },
    [dispatch, store],
  );

  // As the detail the pick opens dates it.
  const dateFormat = useDateTimeFormat({
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Newest first; picked, one is inspected as its marker's click does, and its
  // elements listed. The inspected one isn't loaded again.
  return (
    <ItemList
      items={changesets
        .toSorted((a, b) => b.closedAt.getTime() - a.closedAt.getTime())
        .map((changeset) => {
          const current = inspectedId === changeset.id;

          return {
            key: String(changeset.id),
            icon: <FaPencilAlt />,
            label: changeset.userName,
            detail: changeset.description || undefined,
            subline: dateFormat.format(changeset.closedAt),
            actions: current ? [] : [changesetsInspect(changeset.id)],
            onPick: current
              ? undefined
              : () => trackMatomo(['trackEvent', 'Changesets', 'inspect']),
            opens: { feature: 'changesets', elements: true },
            current,
            // Outlined on the map, as hovering its marker does.
            onHover: (hovering) =>
              dispatch(changesetsHover(hovering ? changeset.id : null)),
            bbox: () => changeset.bbox,
          };
        })}
    />
  );
}
