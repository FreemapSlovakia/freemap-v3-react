import {
  closeTool,
  convertToDataViewer,
  type DataViewerSource,
  openTool,
  type Selection,
  selectFeature,
} from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import {
  dataViewerSetData,
  dataViewerSetTrackUID,
} from '@features/dataViewer/model/actions.js';
import { drawingLineDelete } from '@features/drawing/model/actions/drawingLineActions.js';
import { drawingPointDelete } from '@features/drawing/model/actions/drawingPointActions.js';
import { elevationChartClose } from '@features/elevationChart/model/actions.js';
import {
  buildExportFeatureCollection,
  type ExportInclude,
} from '@features/mapFeaturesExport/model/buildExportFeatureCollection.js';
import { objectsSetFilter } from '@features/objects/model/actions.js';
import { loadObjectsMessages } from '@features/objects/translations/loadObjectsMessages.js';
import { fetchOsmFullGeojson } from '@features/osm/model/fetchOsmFullGeojson.js';
import { searchUnselectResult } from '@features/search/model/actions.js';
import { activeSearchResultSelector } from '@features/search/model/selectors.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { isAbortError } from '@shared/isAbortError.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { featureCollection } from '@turf/helpers';
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
    only?: Selection,
  ): Promise<FeatureCollection> =>
    buildExportFeatureCollection({
      getState,
      include,
      pointMode: { props: true },
      options: { only },
    });

  switch (source.type) {
    case 'drawing-point':
      return build(
        { drawingPoints: true },
        {
          type: 'draw-points',
          id: source.index,
        },
      );

    case 'drawing-line':
      return build(
        { drawingLines: true, drawingAreas: true },
        {
          type: 'draw-line-poly',
          id: source.index,
        },
      );

    case 'search-result': {
      const result = activeSearchResultSelector(getState());

      // Gone while the merge-mode prompt was up. An undefined `only` means "no
      // restriction", so building anyway would take every kept result.
      return result
        ? build({ search: true }, { type: 'search', id: result.id })
        : featureCollection([]);
    }

    case 'objects':
      return build(
        { objects: true },
        source.id ? { type: 'objects', id: source.id } : undefined,
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

    dispatch(dataViewerSetData({ trackGeojson }));

    dispatch(openTool('import-file'));

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
  },
};
