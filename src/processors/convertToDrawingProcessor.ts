import { convertToDrawing, selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { changesetsSet } from '@features/changesets/model/actions.js';
import {
  drawingLineAdd,
  type Line,
  Point,
} from '@features/drawing/model/actions/drawingLineActions.js';
import { drawingPointAdd } from '@features/drawing/model/actions/drawingPointActions.js';
import { garminSymToIconSpec } from '@features/export/garminSymMapping.js';
import {
  osmAndBackgroundToMarkerType,
  osmAndIconToIconSpec,
} from '@features/export/osmandIconMapping.js';
import {
  MarkerType,
  MarkerTypeSchema,
  normalizeMarkerType,
} from '@features/objects/model/actions.js';
import { routePlannerDelete } from '@features/routePlanner/model/actions.js';
import { searchClear } from '@features/search/model/actions.js';
import { trackViewerDelete } from '@features/trackViewer/model/actions.js';
import { tagsToPoiIconSpec } from '@shared/drawingIcons.js';
import { mergeLines } from '@shared/geoutils.js';
import { flatten as turfFlatten } from '@turf/flatten';
import { lineString } from '@turf/helpers';
import { simplify } from '@turf/simplify';

// Plucks drawing-point styling out of a GeoJSON feature's properties.
// Priority: freemap-private (lossless round-trip) → OsmAnd → plain GeoJSON
// keys (imported geojson) → Garmin <sym> / simplestyle marker-symbol.
// Returns undefined fields when nothing matches so the caller can fall
// back to drawing settings / OSM-tag inference.
function pointStyleFromProperties(
  properties: Record<string, unknown> | null | undefined,
): {
  markerType: MarkerType | undefined;
  icon: string | undefined;
  color: string | undefined;
} {
  const get = (key: string): string | undefined => {
    const v = properties?.[key];

    return typeof v === 'string' && v ? v : undefined;
  };

  const rawMarkerType = get('freemap:markerType') ?? get('markerType');

  const markerType =
    (rawMarkerType
      ? MarkerTypeSchema.safeParse(rawMarkerType).data
      : undefined) ?? osmAndBackgroundToMarkerType(get('osmand:background'));

  const icon =
    get('freemap:icon') ??
    osmAndIconToIconSpec(get('osmand:icon')) ??
    get('icon') ??
    garminSymToIconSpec(get('sym') ?? get('marker-symbol'));

  const color =
    get('freemap:color') ?? get('osmand:color') ?? get('marker-color');

  return { markerType, icon, color };
}

// Plucks line/polygon styling out of a GeoJSON feature's properties. GPX has
// no native polygon type, so callers must combine `type` here with a
// closed-ring check to decide whether to dispatch as polygon. Priority:
// freemap:* (lossless) → osmand:* → simplestyle (stroke/fill).
function lineStyleFromProperties(
  properties: Record<string, unknown> | null | undefined,
  closed: boolean,
): {
  type: 'line' | 'polygon' | undefined;
  color: string | undefined;
  fillColor: string | undefined;
  width: number | undefined;
  lineCap: Line['lineCap'];
  lineJoin: Line['lineJoin'];
  dashArray: number[] | undefined;
} {
  const get = (key: string): string | undefined => {
    const v = properties?.[key];

    return typeof v === 'string' && v ? v : undefined;
  };

  const rawType = get('freemap:type');

  const type: 'line' | 'polygon' | undefined =
    rawType === 'polygon' || rawType === 'line'
      ? rawType
      : closed && get('gpx_style:hasFill')
        ? 'polygon'
        : undefined;

  const color = get('freemap:color') ?? get('osmand:color') ?? get('stroke');

  const fillColor =
    get('freemap:fillColor') ?? get('osmand:fill_color') ?? get('fill');

  const rawWidth =
    get('freemap:width') ?? get('osmand:width') ?? get('stroke-width');
  const widthNum = rawWidth ? Number(rawWidth) : Number.NaN;
  const width = Number.isFinite(widthNum) ? widthNum : undefined;

  const rawCap = get('freemap:lineCap') ?? get('stroke-linecap');
  const lineCap =
    rawCap === 'butt' || rawCap === 'round' || rawCap === 'square'
      ? rawCap
      : undefined;

  const rawJoin = get('freemap:lineJoin') ?? get('stroke-linejoin');
  const lineJoin =
    rawJoin === 'miter' || rawJoin === 'round' || rawJoin === 'bevel'
      ? rawJoin
      : undefined;

  const rawDash = get('freemap:dashArray') ?? get('stroke-dasharray');
  const dashArray = rawDash
    ? rawDash
        .split(/[\s,]+/)
        .map(Number)
        .filter((n) => Number.isFinite(n))
    : undefined;

  return { type, color, fillColor, width, lineCap, lineJoin, dashArray };
}

export const convertToDrawingProcessor: Processor<typeof convertToDrawing> = {
  actionCreator: convertToDrawing,
  id: 'deleteFeature',
  transform: ({ getState, dispatch, action: { payload } }) => {
    const state = getState();

    if (payload.type === 'planned-route') {
      const alt =
        state.routePlanner.alternatives[
          state.routePlanner.activeAlternativeIndex
        ];

      if (!alt) {
        return;
      }

      const coords = alt.legs.flatMap((leg) =>
        leg.steps.flatMap((step) => step.geometry.coordinates),
      );

      const ls = lineString(coords.map(([lat, lon]) => [lon, lat]));

      if (payload.tolerance) {
        simplify(ls, {
          mutate: true,
          highQuality: true,
          tolerance: payload.tolerance,
        });
      }

      dispatch(
        drawingLineAdd({
          type: 'line',
          color: state.drawingSettings.drawingColor,
          width: state.drawingSettings.drawingWidth,
          points: ls.geometry.coordinates.map((p, id) => ({
            lat: p[0],
            lon: p[1],
            id,
          })),
        }),
      );

      dispatch(
        selectFeature({
          type: 'draw-line-poly',
          id: state.drawingLines.lines.length,
        }),
      );

      dispatch(routePlannerDelete());
    } else if (payload.type === 'objects') {
      const object = state.objects.objects.find(
        (object) => object.id === payload.id,
      );

      if (object) {
        dispatch(
          drawingPointAdd({
            coords: object.coords,
            label: object.tags?.['name'], // TODO put object type and some other tags to name
            color: state.drawingSettings.drawingColor,
            markerType: normalizeMarkerType(state.objects.selectedIcon),
            icon: tagsToPoiIconSpec(object.tags),
            id: getState().drawingPoints.points.length,
          }),
        );

        dispatch(
          selectFeature({
            type: 'draw-points',
            id: state.drawingPoints.points.length,
          }),
        );
      }
    } else if (payload.type === 'track') {
      if (!state.trackViewer.trackGeojson) {
        return;
      }

      let lineCount = 0;

      let pointCount = 0;

      const { features } = turfFlatten(state.trackViewer.trackGeojson);

      for (const feature of features) {
        const { geometry } = payload.tolerance
          ? simplify(feature, {
              mutate: false,
              highQuality: true,
              tolerance: payload.tolerance,
            })
          : feature;

        if (geometry?.type === 'Point') {
          const style = pointStyleFromProperties(feature.properties);

          dispatch(
            drawingPointAdd({
              label: feature.properties?.['name'],
              color: style.color ?? state.drawingSettings.drawingColor,
              markerType: normalizeMarkerType(
                style.markerType ?? state.objects.selectedIcon,
              ),
              icon: style.icon,
              coords: {
                lat: geometry.coordinates[1],
                lon: geometry.coordinates[0],
              },
              id: getState().drawingPoints.points.length,
            }),
          );

          pointCount++;
        } else if (geometry?.type === 'LineString') {
          const coords = geometry.coordinates;

          const closed =
            coords.length > 2 &&
            coords[0][0] === coords[coords.length - 1][0] &&
            coords[0][1] === coords[coords.length - 1][1];

          const style = lineStyleFromProperties(feature.properties, closed);

          const isPolygon = style.type === 'polygon';

          // For a closed ring rendered as a polygon, drop the duplicate
          // closing point — drawing-lines stores polygons open-ended and
          // closes them at render time.
          const ringCoords = isPolygon && closed ? coords.slice(0, -1) : coords;

          let id = 0;

          const points: Point[] = [];

          for (const node of ringCoords) {
            points.push({
              lat: node[1],
              lon: node[0],
              id: id++,
            });
          }

          dispatch(
            drawingLineAdd({
              type: isPolygon ? 'polygon' : 'line',
              label: feature.properties?.['name'],
              color: style.color ?? state.drawingSettings.drawingColor,
              fillColor: style.fillColor,
              width: style.width ?? state.drawingSettings.drawingWidth,
              lineCap: style.lineCap,
              lineJoin: style.lineJoin,
              dashArray: style.dashArray,
              points,
            }),
          );

          lineCount++;
        }
      }

      dispatch(trackViewerDelete());

      dispatch(
        selectFeature(
          lineCount === 1
            ? { type: 'draw-line-poly', id: state.drawingLines.lines.length }
            : pointCount === 1
              ? { type: 'draw-points', id: state.drawingPoints.points.length }
              : null,
        ),
      );
    } else if (payload.type === 'changesets') {
      const { changesets } = state.changesets;

      if (changesets.length === 0) {
        return;
      }

      for (const changeset of changesets) {
        dispatch(
          drawingPointAdd({
            coords: { lat: changeset.centerLat, lon: changeset.centerLon },
            label: changeset.description,
            color: state.drawingSettings.drawingColor,
            id: getState().drawingPoints.points.length,
          }),
        );
      }

      dispatch(changesetsSet([]));

      dispatch(
        selectFeature(
          changesets.length === 1
            ? { type: 'draw-points', id: state.drawingPoints.points.length }
            : null,
        ),
      );
    } else if (payload.type === 'search-result') {
      // TODO very similar to route conversion - use functions

      if (!state.search.selectedResult?.geojson) {
        return;
      }

      const { geojson } = state.search.selectedResult;

      const { features } = turfFlatten(
        payload.tolerance
          ? simplify(geojson, {
              mutate: false,
              highQuality: true,
              tolerance: payload.tolerance,
            })
          : geojson,
      );

      mergeLines(features);

      let lineCount = 0;

      let pointCount = 0;

      for (const feature of features) {
        const { geometry } = feature;

        if (geometry?.type === 'Point') {
          const tags = (feature.properties ?? {}) as Record<string, string>;

          // Explicit styling (freemap extensions / Garmin sym / simplestyle)
          // wins over OSM tag inference, then falls back to drawing settings.
          const style = pointStyleFromProperties(feature.properties);

          dispatch(
            drawingPointAdd({
              label: feature.properties?.['name'],
              color: style.color ?? state.drawingSettings.drawingColor,
              coords: {
                lat: geometry.coordinates[1],
                lon: geometry.coordinates[0],
              },
              markerType: normalizeMarkerType(
                style.markerType ?? state.objects.selectedIcon,
              ),
              icon: style.icon ?? tagsToPoiIconSpec(tags),
              id: getState().drawingPoints.points.length,
            }),
          );

          pointCount++;
        } else if (
          geometry?.type === 'LineString' ||
          geometry?.type === 'Polygon'
        ) {
          const isGeoJsonPolygon = geometry.type === 'Polygon';

          const rawCoords = isGeoJsonPolygon
            ? geometry.coordinates[0]
            : geometry.coordinates;

          const closed =
            !isGeoJsonPolygon &&
            rawCoords.length > 2 &&
            rawCoords[0][0] === rawCoords[rawCoords.length - 1][0] &&
            rawCoords[0][1] === rawCoords[rawCoords.length - 1][1];

          const style = lineStyleFromProperties(feature.properties, closed);

          const isPolygon = isGeoJsonPolygon || style.type === 'polygon';

          const ringCoords =
            !isGeoJsonPolygon && isPolygon && closed
              ? rawCoords.slice(0, -1)
              : rawCoords;

          let id = 0;

          const points: Point[] = [];

          for (const node of ringCoords) {
            points.push({
              lat: node[1],
              lon: node[0],
              id: id++,
            });
          }

          dispatch(
            drawingLineAdd({
              type: isPolygon ? 'polygon' : 'line',
              label: isPolygon ? feature.properties?.['name'] : undefined, // ignore street names
              color: style.color ?? state.drawingSettings.drawingColor,
              fillColor: style.fillColor,
              width: style.width ?? state.drawingSettings.drawingWidth,
              lineCap: style.lineCap,
              lineJoin: style.lineJoin,
              dashArray: style.dashArray,
              points,
            }),
          );

          lineCount++;
        }
      }

      dispatch(searchClear());

      dispatch(
        selectFeature(
          lineCount === 1
            ? { type: 'draw-line-poly', id: state.drawingLines.lines.length }
            : pointCount === 1
              ? { type: 'draw-points', id: state.drawingPoints.points.length }
              : null,
        ),
      );
    }
  },
};
