import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import {
  mapFitBbox,
  mapRefocus,
  mapToggleLayer,
} from '@features/map/model/actions.js';
import { getCountriesBbox, getLayerBbox } from '@shared/mapDefinitions.js';
import {
  coverageBoxes,
  coverageCountries,
  outsideBoxes,
} from '@shared/mapLibrary/coverage.js';
import { loadIntegratedLayerDef } from '@shared/mapLibrary/mapIndex.js';
import { mapLibraryPreviewEnd, mapLibraryPreviewStart } from '../actions.js';
import { mapByIdSelector } from '../selectors.js';

/**
 * Switches the previewed map on and brings the view to it if it is away. The
 * layers to put back are taken here, from the state the preview starts in.
 */
export const mapLibraryPreviewStartProcessor: Processor<
  typeof mapLibraryPreviewStart
> = {
  actionCreator: mapLibraryPreviewStart,
  transform: ({ getState, action }) =>
    mapLibraryPreviewStart({
      type: action.payload.type,
      restore: getState().map.layers,
    }),
  async handle({ getState, dispatch, action }) {
    const { type } = action.payload;

    dispatch(mapToggleLayer({ type, enable: true }));

    const ref = mapByIdSelector(getState())[type];

    if (!ref) {
      return;
    }

    // An uninstalled built-in map's body loads only once it is on.
    const def =
      ref.def ??
      (ref.origin === 'library'
        ? await loadIntegratedLayerDef(type).catch(() => undefined)
        : undefined);

    const minZoom = def?.minZoom;

    const { lat, lon, zoom, countries: inView } = getState().map;

    // The user's own: an offline map has its downloaded area, a custom one none.
    const box =
      ref.origin === 'library'
        ? (ref.entry.bbox ?? getCountriesBbox(ref.entry.countries))
        : getLayerBbox(ref.def);

    // As the map menu tells it: by the countries in view, else by its box.
    const countries =
      ref.origin === 'library' ? coverageCountries(ref.entry) : undefined;

    // Away from every part, the preview goes to the largest, `box`.
    const away = countries
      ? inView != null && !countries.some((country) => inView.includes(country))
      : box !== undefined &&
        outsideBoxes(
          ref.origin === 'library' ? coverageBoxes(ref.entry) : [box],
          lon,
          lat,
        );

    if (away && box) {
      dispatch(
        mapFitBbox({
          bbox: box,
          minZoom,
          maxZoom:
            def && 'maxNativeZoom' in def ? def.maxNativeZoom : undefined,
        }),
      );
    } else if (minZoom !== undefined && zoom < minZoom) {
      dispatch(mapRefocus({ zoom: minZoom }));
    }
  },
};

/** Puts the earlier layers back unless the map is kept. */
export const mapLibraryPreviewEndProcessor: Processor<
  typeof mapLibraryPreviewEnd
> = {
  actionCreator: mapLibraryPreviewEnd,
  handle({ prevState, dispatch, action }) {
    const { preview } = prevState.mapLibrary;

    if (preview && !action.payload.keep) {
      dispatch(mapRefocus({ layers: preview.restore }));
    }
  },
};

/** Another modal ends a preview as ×, putting the earlier layers back. */
export const mapLibraryPreviewModalProcessor: Processor<typeof setActiveModal> =
  {
    actionCreator: setActiveModal,
    handle({ prevState, dispatch }) {
      const { preview } = prevState.mapLibrary;

      if (preview) {
        dispatch(mapRefocus({ layers: preview.restore }));
      }
    },
  };

const previewedLayerGoneSelector = (state: RootState) => {
  const { preview } = state.mapLibrary;

  return preview !== null && !state.map.layers.includes(preview.type);
};

/**
 * Ends a preview whose map something else took off — the browser's Back, which
 * restores the earlier layers itself — so the library comes back. Registered
 * after the start processor, which has the map on by the time this looks.
 */
export const mapLibraryPreviewGoneProcessor: Processor = {
  stateChangePredicate: previewedLayerGoneSelector,
  handle({ getState, dispatch }) {
    if (previewedLayerGoneSelector(getState())) {
      dispatch(mapLibraryPreviewEnd({ keep: true }));
    }
  },
};
