import {
  applySettings,
  clearMapFeatures,
  closeTool,
  openTool,
  selectFeature,
} from '@app/store/actions.js';
import { elevationSetSettings } from '@features/elevationChart/model/actions.js';
import { affectsElevationSmoothing } from '@features/elevationChart/model/settingsReducer.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import {
  createReducer,
  type Draft,
  isAnyOf,
  isDraft,
  original,
} from '@reduxjs/toolkit';
import { ELEVATION_ATTRIBUTIONS_PROP } from '@shared/elevation.js';
import { lineSegments, withoutPerPointData } from '@shared/geoutils.js';
import type { AttributionDef } from '@shared/mapDefinitions.js';
import { lineStyleFromProperties } from '@shared/styleFromProperties.js';
import { isDrawTool, isMapClickTool } from '@shared/toolDefinitions.js';
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Position,
} from 'geojson';
import { patchedProperties } from '../featureEditing.js';
import {
  canJoinTracks,
  joinTrackFeatures,
  type LineEnd,
  type TrackJoinMode,
} from '../joinTracks.js';
import { simplifyDataFeature } from '../simplifyTrack.js';
import {
  breakApart,
  explodeTrackFeature,
  splitTrackFeature,
  type TrackSplitPoint,
} from '../splitTrack.js';
import { withCanonicalTimesAll } from '../trackChannels.js';
import { isTrackLine, type TrackLine } from '../trackSelection.js';
import {
  completed,
  deletePart,
  deleteVertex,
  editableParts,
  insertVertex,
  isCompleteFeature,
  moveVertex,
  reverseFeature,
  setVertexValues,
} from '../vertexEditing.js';
import {
  dataViewerAddFeatures,
  dataViewerCutHole,
  dataViewerDelete,
  dataViewerDeleteFeature,
  dataViewerDeleteHole,
  dataViewerDeleteVertex,
  dataViewerDetachHole,
  dataViewerDownloadTrack,
  dataViewerDrawAppend,
  dataViewerDrawContinue,
  dataViewerDrawStart,
  dataViewerDrawStop,
  dataViewerEditFeatures,
  dataViewerExplodeTrack,
  dataViewerGpxLoad,
  dataViewerInsertVertex,
  dataViewerJoinTracks,
  dataViewerMakeHole,
  dataViewerMoveVertex,
  dataViewerResolveElevationPrompt,
  dataViewerRestoreStored,
  dataViewerRestoreStoredDone,
  dataViewerReverse,
  dataViewerSetActiveTrack,
  dataViewerSetData,
  dataViewerSetElevation,
  dataViewerSetElevationPrompt,
  dataViewerSetFeatureProperties,
  dataViewerSetGpxUrl,
  dataViewerSetJoining,
  dataViewerSetRenderGeojson,
  dataViewerSetSplitPoint,
  dataViewerSetSplitting,
  dataViewerSetTrackUID,
  dataViewerSetVertexValues,
  dataViewerSimplify,
  dataViewerSplitTrack,
  type ElevationConsumer,
  type ElevationFillMode,
} from './actions.js';
import { documentFeatures, ingest, withTypedGeometry } from './collection.js';

export interface DataViewerStateBase {
  trackGeojson: FeatureCollection | null;
  // Render-only densified copy of `trackGeojson` (extra DEM-sampled points on
  // long segments). A cache: `null` means consumers read `trackGeojson`. Never
  // exported; cleared whenever `trackGeojson` changes.
  renderTrackGeojson: FeatureCollection | null;
  trackUID: string | null;
  gpxUrl: string | null;
}

export interface DataViewerState extends DataViewerStateBase {
  elevationPrompt: ElevationConsumer | null;
  // The user's elevation decision for the loaded track: 'undecided' until they
  // answer the prompt (so we don't ask again, and the info panel can report the
  // source), then the chosen fill mode. 'all' means every point now comes from
  // the terrain model, so another server overwrite would be pointless.
  elevationDecision: ElevationDecision;
  // The credits the elevation API resolved for the values it wrote into
  // `trackGeojson`. Kept because the write happens once, at the prompt, while the
  // chart crediting it can open much later — and a dense recording densifies to
  // nothing, so the render copy alone would credit nobody. Tracks
  // `elevationDecision`: emptied whenever that is.
  elevationAttributions: AttributionDef[];
  // Which line the chart / "more info" / matching act on, by index into
  // `trackGeojson.features`; `null` falls back to the first line. Reset on load.
  // Selecting a line aims it here; deselecting leaves it, so an open chart
  // stays on its track.
  activeTrackIndex: number | null;
  // Whether the split cursor is armed on the selected track.
  splitting: boolean;
  // The vertex the armed cursor is frozen at, which a finger picks before
  // confirming the cut from the toolbar. A pointer that can hover cuts outright
  // and never sets this.
  splitPoint: TrackSplitPoint | null;
  // The track a join is armed on, how the two are put together, and the end
  // armed from, if any; the next line clicked is joined onto it.
  joinWith: { featureIndex: number; mode: TrackJoinMode; end?: LineEnd } | null;
  // The snapshot still being read back, if any. The only way to tell "nothing
  // loaded" from "not loaded yet" on a reload, and which of several quick
  // history steps a finished read still stands for.
  restoringStored: string | true | null;
  // The line or ring map clicks append to while drawing.
  drawing: { index: number; part: number } | null;
  // The polygon the next drawing click starts a hole of.
  holeFor: number | null;
}

export type ElevationDecision =
  | 'undecided'
  | Exclude<ElevationFillMode, 'clear'>;

export const cleanState: DataViewerStateBase = {
  trackGeojson: null,
  renderTrackGeojson: null,
  trackUID: null,
  gpxUrl: null, // TODO to separate reducer (?)
};

export const dataViewerInitialState: DataViewerState = {
  elevationPrompt: null,
  elevationDecision: 'undecided',
  elevationAttributions: [],
  activeTrackIndex: null,
  splitting: false,
  splitPoint: null,
  joinWith: null,
  restoringStored: null,
  drawing: null,
  holeFor: null,
  ...cleanState,
};

/** Both editing modes are armed on one track, so anything else takes them off. */
function clearModes(state: DataViewerState) {
  state.splitting = false;

  state.splitPoint = null;

  state.joinWith = null;
}

/** An edit makes the data no longer the file it came from. */
function markEdited(state: DataViewerState) {
  state.trackUID = null;

  state.gpxUrl = null;
}

/** New properties for features, the drawn render copy restyled with them. */
function writeProperties(
  state: DataViewerState,
  edits: readonly {
    index: number;
    properties: GeoJsonProperties;
    position?: Position;
  }[],
) {
  for (const { index, properties, position } of edits) {
    const feature = baseFeature(state, index);

    if (!feature) {
      continue;
    }

    const restyled = withProperties(feature, properties);

    const edited =
      position && restyled.geometry.type === 'Point'
        ? {
            ...restyled,
            geometry: { type: 'Point' as const, coordinates: position },
          }
        : restyled;

    state.trackGeojson!.features[index] = edited;

    if (edited.geometry !== feature.geometry) {
      markGeometryEdited(state);

      continue;
    }

    // The densified copy is what gets drawn where it exists, so it needs the
    // new style — but not the properties wholesale: its coordinates are not the
    // recorded ones, and the models its sampling credited are stamped on it alone.
    const rendered = state.renderTrackGeojson?.features[index];

    if (rendered) {
      const credits = rendered.properties?.[ELEVATION_ATTRIBUTIONS_PROP];

      rendered.properties = withoutPerPointData(properties);

      if (credits !== undefined && rendered.properties) {
        rendered.properties[ELEVATION_ATTRIBUTIONS_PROP] = credits;
      }
    }
  }

  markEdited(state);
}

/** The same, plus everything derived from the geometry as it was. */
function markGeometryEdited(state: DataViewerState) {
  markEdited(state);

  state.renderTrackGeojson = null;

  clearModes(state);
}

/**
 * Puts the given features in the place of one, shifting whatever a later index
 * names. Nothing left takes the collection with it.
 */
function replaceFeature(
  state: Draft<DataViewerState>,
  index: number,
  replacement: Feature[],
) {
  const features = state.trackGeojson?.features;

  if (!features) {
    return;
  }

  features.splice(index, 1, ...replacement);

  markGeometryEdited(state);

  if (features.length === 0) {
    state.trackGeojson = null;
  }

  // The first piece keeps the original index, so only what came after moves.
  const shift = (at: number) =>
    at === index && replacement.length === 0
      ? null
      : at > index
        ? at + replacement.length - 1
        : at;

  if (state.activeTrackIndex !== null) {
    state.activeTrackIndex = shift(state.activeTrackIndex);
  }

  if (state.drawing) {
    const at = shift(state.drawing.index);

    state.drawing = at === null ? null : { ...state.drawing, index: at };
  }

  if (state.holeFor !== null) {
    state.holeFor = shift(state.holeFor);
  }
}

/**
 * The feature as the store held it before this action, outside the draft, so
 * an edit of a long track copies plain arrays rather than proxying each vertex.
 */
function baseFeature(
  state: Draft<DataViewerState>,
  index: number,
): Feature | undefined {
  const feature = state.trackGeojson?.features[index];

  return (
    feature && (isDraft(feature) ? (original(feature) as Feature) : feature)
  );
}

function setFeature(
  state: Draft<DataViewerState>,
  index: number,
  feature: Feature,
) {
  if (state.trackGeojson?.features[index]) {
    state.trackGeojson.features[index] = feature;

    markGeometryEdited(state);
  }
}

/** Ends drawing; what was being drawn goes if it never became a line or ring. */
function endDrawing(state: Draft<DataViewerState>) {
  const { drawing } = state;

  state.drawing = null;

  state.holeFor = null;

  const feature = drawing && baseFeature(state, drawing.index);

  if (!drawing || !feature) {
    return;
  }

  const kept = completed(feature);

  if (!kept) {
    replaceFeature(state, drawing.index, []);
  } else if (kept !== feature) {
    state.trackGeojson!.features[drawing.index] = kept;
  }
}

/** A hole of `feature` as a polygon of its own, wearing its style alone. */
function holeAsPolygon(feature: Feature, ring: Position[]): Feature {
  return {
    type: 'Feature',
    properties: patchedProperties(
      { ...feature, properties: {} },
      lineStyleFromProperties(feature.properties, true),
    ),
    geometry: { type: 'Polygon', coordinates: [ring] },
  };
}

function withProperties(
  feature: Feature,
  properties: GeoJsonProperties,
): Feature {
  return withTypedGeometry({ ...feature, properties });
}

export const dataViewerReducer = createReducer(
  dataViewerInitialState,
  (builder) =>
    builder
      .addCase(clearMapFeatures, () => dataViewerInitialState)
      .addCase(dataViewerDelete, () => dataViewerInitialState)
      .addCase(dataViewerEditFeatures, (state, { payload }) => {
        // Not a draft when there is no collection yet.
        const before =
          state.trackGeojson && isDraft(state.trackGeojson)
            ? original(state.trackGeojson)!.features
            : [];

        const active =
          state.activeTrackIndex === null
            ? undefined
            : before[state.activeTrackIndex];

        endDrawing(state);

        // The payload was built before the drawing ended, so a line still too
        // short to be one is in it; dropped here as `endDrawing` drops it.
        const kept = payload.flatMap((feature) => completed(feature) ?? []);

        const features = ingest(kept);

        state.trackGeojson =
          features.length === 0
            ? null
            : { type: 'FeatureCollection', features };

        const at = active ? kept.indexOf(active) : -1;

        state.activeTrackIndex = at === -1 ? null : at;

        markGeometryEdited(state);
      })
      .addCase(dataViewerAddFeatures, (state, { payload }) => {
        const added = ingest(payload.features);

        if (added.length === 0) {
          return;
        }

        endDrawing(state);

        if (state.trackGeojson) {
          state.trackGeojson.features.push(...added);
        } else {
          state.trackGeojson = { type: 'FeatureCollection', features: added };
        }

        markGeometryEdited(state);
      })
      .addCase(dataViewerMoveVertex, (state, { payload }) => {
        const feature = baseFeature(state, payload.index);

        if (feature) {
          setFeature(
            state,
            payload.index,
            moveVertex(feature, payload.part, payload.vertex, payload.position),
          );
        }
      })
      .addCase(dataViewerSetVertexValues, (state, { payload }) => {
        const feature = baseFeature(state, payload.index);

        if (feature) {
          setFeature(
            state,
            payload.index,
            setVertexValues(
              feature,
              payload.part,
              payload.vertex,
              payload.position,
              payload.values,
            ),
          );
        }
      })
      .addCase(dataViewerInsertVertex, (state, { payload }) => {
        const feature = baseFeature(state, payload.index);

        if (feature) {
          setFeature(
            state,
            payload.index,
            insertVertex(
              feature,
              payload.part,
              payload.vertex,
              payload.position,
            ),
          );
        }
      })
      .addCase(dataViewerDeleteVertex, (state, { payload }) => {
        const feature = baseFeature(state, payload.index);

        if (!feature) {
          return;
        }

        const deleted = deleteVertex(feature, payload.part, payload.vertex);

        // The last vertex of a hole takes the hole along; of a segment, that
        // segment alone; of a line, the line.
        const edited =
          deleted.geometry.type === 'MultiLineString' &&
          (editableParts(deleted.geometry)?.[payload.part]?.length ?? 0) < 2
            ? deletePart(deleted, payload.part)
            : deleted;

        const kept =
          payload.part > 0 && feature.geometry.type === 'Polygon'
            ? completed(edited)
            : isCompleteFeature(edited)
              ? edited
              : undefined;

        if (kept) {
          setFeature(state, payload.index, kept);
        } else {
          replaceFeature(state, payload.index, []);
        }
      })
      .addCase(dataViewerDeleteHole, (state, { payload }) => {
        const feature = baseFeature(state, payload.index);

        if (feature) {
          setFeature(state, payload.index, deletePart(feature, payload.part));
        }
      })
      .addCase(dataViewerDrawStart, (state, { payload }) => {
        endDrawing(state);

        if ('ring' in payload) {
          const feature = baseFeature(state, payload.ring);

          const rings = feature && editableParts(feature.geometry);

          if (feature?.geometry.type !== 'Polygon' || !rings) {
            return;
          }

          setFeature(
            state,
            payload.ring,
            insertVertex(feature, rings.length, 0, payload.position),
          );

          state.drawing = { index: payload.ring, part: rings.length };

          return;
        }

        const feature: Feature = {
          type: 'Feature',
          properties: payload.properties,
          geometry:
            payload.type === 'line'
              ? { type: 'LineString', coordinates: [payload.position] }
              : {
                  type: 'Polygon',
                  coordinates: [[payload.position, payload.position]],
                },
        };

        if (state.trackGeojson) {
          state.trackGeojson.features.push(feature);
        } else {
          state.trackGeojson = {
            type: 'FeatureCollection',
            features: [feature],
          };
        }

        markGeometryEdited(state);

        state.drawing = {
          index: state.trackGeojson.features.length - 1,
          part: 0,
        };
      })
      .addCase(dataViewerDrawAppend, (state, { payload }) => {
        const { drawing } = state;

        const feature = drawing && baseFeature(state, drawing.index);

        const vertices =
          feature && editableParts(feature.geometry)?.[drawing.part];

        if (drawing && feature && vertices) {
          setFeature(
            state,
            drawing.index,
            insertVertex(feature, drawing.part, vertices.length, payload),
          );
        }
      })
      .addCase(dataViewerDrawStop, endDrawing)
      .addCase(dataViewerDrawContinue, (state, { payload }) => {
        endDrawing(state);

        const feature = baseFeature(state, payload.index);

        if (!feature || !isTrackLine(feature)) {
          return;
        }

        // Drawing appends at the end of the last segment, so a line continued
        // from its start turns — a gapped one segments and all.
        if (payload.part === 0 && payload.vertex === 0) {
          setFeature(state, payload.index, reverseFeature(feature));
        }

        state.drawing = {
          index: payload.index,
          part: lineSegments(feature.geometry).length - 1,
        };
      })
      .addCase(dataViewerReverse, (state, { payload }) => {
        const feature = baseFeature(state, payload);

        if (feature) {
          setFeature(state, payload, reverseFeature(feature));
        }
      })
      .addCase(dataViewerCutHole, (state, { payload }) => {
        endDrawing(state);

        state.holeFor = payload;
      })
      .addCase(dataViewerMakeHole, (state, { payload }) => {
        const hole = baseFeature(state, payload.index);

        const parent = baseFeature(state, payload.parent);

        if (
          hole?.geometry.type !== 'Polygon' ||
          parent?.geometry.type !== 'Polygon' ||
          payload.index === payload.parent
        ) {
          return;
        }

        setFeature(state, payload.parent, {
          ...parent,
          geometry: {
            ...parent.geometry,
            coordinates: [
              ...parent.geometry.coordinates,
              hole.geometry.coordinates[0] ?? [],
            ],
          },
        });

        replaceFeature(state, payload.index, []);
      })
      .addCase(dataViewerDetachHole, (state, { payload }) => {
        const feature = baseFeature(state, payload.index);

        const ring =
          feature?.geometry.type === 'Polygon' && payload.part > 0
            ? feature.geometry.coordinates[payload.part]
            : undefined;

        if (feature?.geometry.type !== 'Polygon' || !ring) {
          return;
        }

        replaceFeature(state, payload.index, [
          {
            ...feature,
            geometry: {
              ...feature.geometry,
              coordinates: feature.geometry.coordinates.toSpliced(
                payload.part,
                1,
              ),
            },
          },
          holeAsPolygon(feature, ring),
        ]);
      })
      .addCase(applySettings, (state, { payload }) => {
        const { drawing } = payload;

        if (!payload.drawingApplyAll || !drawing || !state.trackGeojson) {
          return;
        }

        writeProperties(
          state,
          state.trackGeojson.features.map((feature, index) => ({
            index,
            properties: patchedProperties(feature, drawing),
          })),
        );
      })
      .addCase(dataViewerSetData, (state, action) => {
        // A new track is a fresh elevation decision.
        if (action.payload.trackGeojson) {
          const { trackGeojson } = action.payload;

          const features = ingest(trackGeojson.features);

          // Not only imports land here: a saved map and the IndexedDB restore
          // hand back whatever they stored, root-spelled times included.
          state.trackGeojson =
            features.length === 0
              ? null
              : withCanonicalTimesAll(
                  features.every((f, i) => f === trackGeojson.features[i])
                    ? trackGeojson
                    : { ...trackGeojson, features },
                );

          state.drawing = null;

          state.holeFor = null;

          // Invalidate the densified render cache for the new track.
          state.renderTrackGeojson = null;

          state.elevationDecision = 'undecided';

          state.elevationAttributions = [];

          // The feature indices changed; fall back to the first line.
          state.activeTrackIndex = null;

          clearModes(state);
        }
      })
      .addCase(dataViewerDeleteFeature, (state, { payload }) => {
        const features = state.trackGeojson?.features;

        if (!features?.[payload]) {
          return;
        }

        if (features.length === 1) {
          return dataViewerInitialState;
        }

        // A replacement with nothing, which leaves no active line behind.
        replaceFeature(state, payload, []);
      })
      .addCase(dataViewerSetFeatureProperties, (state, { payload }) => {
        writeProperties(state, payload);
      })
      .addCase(dataViewerSetElevation, (state, action) => {
        state.trackGeojson = action.payload.trackGeojson;

        state.elevationAttributions = action.payload.attributions;

        // Re-enriched elevation invalidates the densified render cache.
        state.renderTrackGeojson = null;
      })
      .addCase(dataViewerSetRenderGeojson, (state, action) => {
        state.renderTrackGeojson = action.payload;
      })
      .addCase(elevationSetSettings, (state, { payload }) => {
        // The render copy is derived from the smoothing windows, and from
        // nothing else in the slice — the steepness window is read off the
        // drawn points, so dropping the cache for it would resample for nothing.
        if (affectsElevationSmoothing(payload)) {
          state.renderTrackGeojson = null;
        }
      })
      .addCase(dataViewerSetTrackUID, (state, action) => {
        state.trackUID = action.payload;
      })
      .addCase(dataViewerDownloadTrack, (state, action) => {
        state.trackUID = action.payload;
      })
      .addCase(dataViewerSetActiveTrack, (state, action) => {
        state.activeTrackIndex = action.payload;
      })
      .addCase(dataViewerSetSplitting, (state, { payload }) => {
        clearModes(state);

        state.splitting = payload;
      })
      .addCase(dataViewerSetSplitPoint, (state, { payload }) => {
        state.splitPoint = payload;
      })
      .addCase(dataViewerSetJoining, (state, { payload }) => {
        clearModes(state);

        state.joinWith = payload;
      })
      // The cursor is armed for one track; anything else being selected (or the
      // selection going) leaves it aimed at nothing. Reaching for a tool takes
      // the selection away without saying so, and the armed click would
      // otherwise stay live on a map that no longer offers a way to cancel it.
      // Drawing ends the same way.
      .addCase(selectFeature, (state) => {
        clearModes(state);

        endDrawing(state);
      })
      .addCase(dataViewerSplitTrack, (state, { payload }) => {
        const feature = state.trackGeojson?.features[payload.featureIndex];

        if (!feature || !isTrackLine(feature)) {
          return;
        }

        const halves = splitTrackFeature(
          feature,
          payload.segmentIndex,
          payload.pointIndex,
        );

        if (halves) {
          replaceFeature(state, payload.featureIndex, halves);
        }
      })
      .addCase(dataViewerJoinTracks, (state, { payload, meta }) => {
        const { joinWith } = state;

        const features = state.trackGeojson?.features;

        if (!joinWith || !features) {
          return;
        }

        const target = joinWith.featureIndex;

        if (!canJoinTracks(features, target, payload)) {
          return;
        }

        features[target] = joinTrackFeatures(
          features[target] as TrackLine,
          features[payload] as TrackLine,
          joinWith.mode,
          { a: joinWith.end, b: meta.end },
        );

        features.splice(payload, 1);

        markGeometryEdited(state);

        // Unlike a cut, a join mixes two provenances: what was decided for one
        // track says nothing about the other's points, and a model that
        // answered for one must not be credited for both.
        state.elevationDecision = 'undecided';

        state.elevationAttributions = [];

        // The join lands where the armed track was, minus the one taken out
        // from under it; anything past the removed track moves up.
        const joined = target - (payload < target ? 1 : 0);

        const active = state.activeTrackIndex;

        if (active !== null) {
          state.activeTrackIndex =
            active === target || active === payload
              ? joined
              : active > payload
                ? active - 1
                : active;
        }
      })
      .addCase(dataViewerExplodeTrack, (state, { payload }) => {
        const feature = state.trackGeojson?.features[payload];

        if (!feature) {
          return;
        }

        const { geometry } = feature;

        // A polygon with holes: the outer ring stays the feature, each hole a
        // polygon of its own, as Detach hole makes it.
        const parts = isTrackLine(feature)
          ? explodeTrackFeature(feature)
          : geometry.type === 'Polygon'
            ? geometry.coordinates.length > 1
              ? [
                  {
                    ...feature,
                    geometry: {
                      ...geometry,
                      coordinates: [geometry.coordinates[0]!],
                    },
                  },
                  ...geometry.coordinates
                    .slice(1)
                    .map((ring) => holeAsPolygon(feature, ring)),
                ]
              : null
            : breakApart(feature);

        if (parts) {
          replaceFeature(state, payload, parts);
        }
      })
      .addCase(dataViewerSimplify, (state, { payload }) => {
        const features = state.trackGeojson?.features;

        if (!features || payload.tolerance <= 0) {
          return;
        }

        let changed = false;

        for (const [index, feature] of features.entries()) {
          if (payload.id !== undefined && payload.id !== index) {
            continue;
          }

          const simplified = simplifyDataFeature(feature, payload.tolerance);

          if (simplified) {
            features[index] = simplified;

            changed = true;
          }
        }

        // Indices are untouched, so the selection and the active line stand.
        if (changed) {
          markGeometryEdited(state);
        }
      })
      .addCase(dataViewerSetElevationPrompt, (state, action) => {
        state.elevationPrompt = action.payload;
      })
      .addCase(dataViewerResolveElevationPrompt, (state, action) => {
        state.elevationPrompt = null;

        const { mode, consumer } = action.payload;

        // One feature's update decides nothing for the rest; with every
        // feature's elevation cleared there is nothing decided either.
        if (consumer.type !== 'update' || consumer.index === undefined) {
          state.elevationDecision = mode === 'clear' ? 'undecided' : mode;
        }
      })
      .addCase(dataViewerRestoreStored, (state, { payload }) =>
        payload === null
          ? dataViewerInitialState
          : { ...state, restoringStored: payload },
      )
      .addCase(dataViewerRestoreStoredDone, (state, { payload }) => {
        if (state.restoringStored === payload) {
          state.restoringStored = null;
        }
      })
      .addCase(dataViewerSetGpxUrl, (state, { payload }) => {
        state.gpxUrl = payload;
      })
      .addCase(dataViewerGpxLoad, (state, action) => {
        state.gpxUrl = action.payload;
      })
      .addCase(
        mapsLoaded,
        (
          state,
          {
            payload: {
              merge,
              data: { trackViewer, points, lines },
            },
          },
        ) => {
          const features = [
            ...(merge ? (state.trackGeojson?.features ?? []) : []),
            ...documentFeatures(
              points,
              lines,
              trackViewer?.trackGeojson,
              trackViewer?.order,
            ),
          ];

          // A source the document names is downloaded once and kept as features
          // (`mapsLoadProcessor`); a map never re-reads it.
          const restored: DataViewerState = {
            ...dataViewerInitialState,
            trackGeojson: null,
          };

          return features.length
            ? {
                ...restored,
                trackGeojson: { type: 'FeatureCollection', features },
              }
            : restored;
        },
      )
      .addMatcher(isAnyOf(openTool, closeTool), clearModes)
      // Reaching for another tool that takes map clicks ends the drawing, as
      // does closing the drawing tool. A toolbar-only tool takes no clicks.
      .addMatcher(
        (action) =>
          (openTool.match(action) && isMapClickTool(action.payload)) ||
          (closeTool.match(action) &&
            (isDrawTool(action.payload) || action.payload === 'import-file')),
        endDrawing,
      ),
);
