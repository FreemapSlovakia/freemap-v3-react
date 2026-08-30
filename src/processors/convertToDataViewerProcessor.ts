import {
  closeTool,
  convertToDataViewer,
  type DataViewerSource,
  openTool,
  selectFeature,
} from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { changesetsSet } from '@features/changesets/model/actions.js';
import {
  dataViewerSetData,
  dataViewerSetTrackUID,
} from '@features/dataViewer/model/actions.js';
import { normalizeName } from '@features/dataViewer/parseDataFile.js';
import { drawingLineDelete } from '@features/drawing/model/actions/drawingLineActions.js';
import { drawingPointDelete } from '@features/drawing/model/actions/drawingPointActions.js';
import { elevationChartClose } from '@features/elevationChart/model/actions.js';
import {
  type BuildExportOptions,
  buildExportFeatureCollection,
  type ExportInclude,
} from '@features/mapFeaturesExport/model/buildExportFeatureCollection.js';
import { objectsSetFilter } from '@features/objects/model/actions.js';
import { loadObjectsMessages } from '@features/objects/translations/loadObjectsMessages.js';
import { fetchOsmFullGeojson } from '@features/osm/model/fetchOsmFullGeojson.js';
import { routePlannerDelete } from '@features/routePlanner/model/actions.js';
import { searchUnselectResult } from '@features/search/model/actions.js';
import { activeSearchResultSelector } from '@features/search/model/selectors.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { isAbortError } from '@shared/isAbortError.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { featureCollection, point } from '@turf/helpers';
import type { FeatureCollection } from 'geojson';

/**
 * The features to copy, as the data export writes them — so what lands in the
 * viewer carries the same styles and the same lossless `freemap:*` shadows a
 * file exported from here would, and reads back the same way.
 */
async function collect(
  source: DataViewerSource,
  getState: () => RootState,
): Promise<FeatureCollection> {
  const build = (
    include: ExportInclude,
    options: BuildExportOptions = {},
  ): Promise<FeatureCollection> =>
    buildExportFeatureCollection({
      getState,
      include,
      pointMode: { props: true },
      options,
    });

  switch (source.type) {
    case 'drawing-point':
      return build(
        { drawingPoints: true },
        {
          only: {
            type: 'draw-points',
            id: source.index,
          },
        },
      );

    case 'drawing-line':
      return build(
        { drawingLines: true, drawingAreas: true },
        {
          only: {
            type: 'draw-line-poly',
            id: source.index,
          },
        },
      );

    case 'planned-route':
      // Only the alternative being followed, as the drawing conversion takes it
      // — one line per same-mode stretch, in the color the map paints it.
      return build({ plannedRoute: true }, { route: 'active' });

    case 'changesets':
      // The one source the export builder doesn't write: a point per changeset
      // at its centre, named by its comment and carrying what the tool knows —
      // the id, the author and when it was closed.
      return featureCollection(
        getState().changesets.changesets.map((changeset) =>
          point([changeset.centerLon, changeset.centerLat], {
            ...(changeset.description && { title: changeset.description }),
            changeset: String(changeset.id),
            user: changeset.userName,
            closed_at: changeset.closedAt.toISOString(),
          }),
        ),
      );

    case 'search-result': {
      const result = activeSearchResultSelector(getState());

      // Gone while the merge-mode prompt was up. An undefined `only` means "no
      // restriction", so building anyway would take every kept result.
      return result
        ? build({ search: true }, { only: { type: 'search', id: result.id } })
        : featureCollection([]);
    }

    case 'objects':
      return build(
        { objects: true },
        source.id ? { only: { type: 'objects', id: source.id } } : {},
      );

    case 'objects-geometry': {
      // The one source that isn't on the map yet: the element's full geometry
      // comes from OSM, as a feature of its own or a collection of them.
      const geojson = await fetchOsmFullGeojson(source.id, getState);

      return geojson.type === 'FeatureCollection'
        ? geojson
        : featureCollection([geojson]);
    }
  }
}

/**
 * Hands map features to the track viewer and opens it. The source goes with
 * them — see {@link convertToDataViewer} — so the switch below deletes a drawn
 * feature, takes a lookup result off the map, or drops the objects predicate.
 */
export const convertToDataViewerProcessor: Processor<
  typeof convertToDataViewer
> = {
  actionCreator: convertToDataViewer,
  handle: async ({ getState, dispatch, action }) => {
    const { source, mode } = action.payload;

    let copied: FeatureCollection;

    try {
      copied = await collect(source, getState);
    } catch (err) {
      if (isAbortError(err)) {
        return;
      }

      dispatch(
        toastsAdd({
          style: 'danger',
          messageKey: 'fetchingError',
          messageParams: { err },
          messageLoader: loadObjectsMessages,
        }),
      );

      return;
    }

    if (copied.features.length === 0) {
      return;
    }

    // The export writes a label as simplestyle `title`, while the viewer reads
    // `name` — the same normalization a loaded file gets.
    copied = {
      ...copied,
      features: copied.features.map(normalizeName),
    };

    trackMatomo(['trackEvent', 'DataViewer', 'copyIn', source.type]);

    const existing = getState().trackViewer.trackGeojson;

    const trackGeojson: FeatureCollection =
      mode === 'append' && existing
        ? {
            type: 'FeatureCollection',
            features: [...existing.features, ...copied.features],
          }
        : copied;

    // The chart is of the data that is being added to or replaced; it has no
    // feature identity of its own, so it would silently redraw as another.
    dispatch(elevationChartClose());

    // Not a server-shared track, so it carries no id to share it back by.
    dispatch(dataViewerSetTrackUID(null));

    switch (source.type) {
      case 'drawing-point':
        dispatch(selectFeature(null));

        dispatch(drawingPointDelete({ index: source.index }));

        break;

      case 'drawing-line':
        dispatch(selectFeature(null));

        // Takes the ring's holes with it, as deleting a polygon always does.
        dispatch(drawingLineDelete({ lineIndex: source.index }));

        break;

      case 'planned-route':
        // Clears a route-point/leg selection of its own.
        dispatch(routePlannerDelete());

        dispatch(closeTool('route-planner'));

        break;

      case 'changesets':
        dispatch(changesetsSet([]));

        dispatch(closeTool('changesets'));

        break;

      case 'search-result': {
        const result = activeSearchResultSelector(getState());

        if (result) {
          dispatch(searchUnselectResult(result.id));
        }

        break;
      }

      case 'objects':
        // Left set, the predicate would fetch them again on the next pan and
        // draw them over what they became. Both wait for the build to succeed:
        // a failed one must leave the filter and its toolbar as they were.
        if (!source.id) {
          dispatch(objectsSetFilter([]));

          dispatch(closeTool('objects'));
        }

        break;

      case 'objects-geometry':
        break;
    }

    // After the source is let go of: dropping a drawing selection would
    // otherwise take the converted feature's own selection with it.
    dispatch(dataViewerSetData({ trackGeojson, select: true }));

    dispatch(openTool('import-file'));
  },
};
