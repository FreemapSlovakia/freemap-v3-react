import {
  drawingLineJoinStart,
  drawingLineStopDrawing,
} from './actions/drawingLineActions.js';
import { elevationChartClose } from './actions/elevationChartActions.js';
import {
  galleryCancelShowOnTheMap,
  galleryClear,
  galleryEditPicture,
  galleryList,
  galleryRequestImage,
  gallerySetItemForPositionPicking,
  galleryShowOnTheMap,
} from './actions/galleryActions.js';
import {
  clearMapFeatures,
  deleteFeature,
  openInExternalApp,
  selectFeature,
  setActiveModal,
  setSelectingHomeLocation,
  setTool,
} from './actions/mainActions.js';
import { mapRefocus } from './actions/mapActions.js';
import { integratedLayerDefs } from './mapDefinitions.js';
import { showGalleryViewerSelector } from './selectors/mainSelectors.js';
import { MyStore, RootState } from './store.js';
import { toolDefinitions } from './toolDefinitions.js';

let keyTimer: number | null = null;

let initCode: 'KeyE' | 'KeyG' | 'KeyP' | 'KeyJ' | null = null;

function handleEvent(event: KeyboardEvent, state: RootState) {
  const withModifiers =
    event.ctrlKey || event.altKey || event.metaKey || event.isComposing;

  const suspendedModal =
    state.main.selectingHomeLocation !== false ||
    state.gallery.pickingPositionForId ||
    state.gallery.showPosition;

  const showingModal =
    !!state.main.activeModal ||
    !!state.gallery.activeImageId ||
    !!state.main.documentKey;
  //  ||
  // state.main.selectingHomeLocation ||
  // state.gallery.pickingPositionForId ||
  // state.gallery.showPosition;

  if (!withModifiers && event.code === 'Escape') {
    if (document.querySelector('*[aria-expanded=true]') !== null) {
      return undefined;
    }

    if (state.gallery.pickingPositionForId) {
      return gallerySetItemForPositionPicking(null);
    }

    if (showGalleryViewerSelector(state)) {
      return state.gallery.editModel ? galleryEditPicture() : galleryClear();
    }

    if (state.elevationChart.elevationProfilePoints) {
      return elevationChartClose();
    }

    if (state.drawingLines.joinWith) {
      return drawingLineJoinStart(undefined);
    }

    if (state.drawingLines.drawing) {
      return drawingLineStopDrawing();
    }

    if (state.main.selectingHomeLocation !== false) {
      return setSelectingHomeLocation(false);
    }

    if (state.gallery.showPosition) {
      return galleryCancelShowOnTheMap();
    }

    if (!showingModal && !suspendedModal && state.main.selection) {
      return selectFeature(null);
    }

    if (!showingModal && !suspendedModal && state.main.tool) {
      return setTool(null);
    }

    return undefined;
  }

  if (
    event.target instanceof HTMLElement &&
    ['input', 'select', 'textarea'].includes(event.target.tagName.toLowerCase())
  ) {
    return undefined;
  }

  if (!showingModal && (event.ctrlKey || event.metaKey)) {
    if (event.code === 'KeyZ') {
      history.back();

      return undefined;
    }

    if (event.code === 'KeyY') {
      history.forward();

      return undefined;
    }
  }

  if (withModifiers) {
    return undefined;
  }

  if (showGalleryViewerSelector(state)) {
    if (event.code === 'KeyS') {
      return galleryShowOnTheMap();
    }

    if (!state.gallery.editModel && event.code === 'KeyM') {
      return galleryEditPicture();
    }
  }

  if (
    showGalleryViewerSelector(state) &&
    state.gallery.imageIds &&
    state.gallery.imageIds.length > 1
  ) {
    if (event.code === 'ArrowLeft') {
      return galleryRequestImage('prev');
    }

    if (event.code === 'ArrowRight') {
      return galleryRequestImage('next');
    }
  }

  if (
    !keyTimer &&
    (!showingModal || suspendedModal) &&
    (!window.fmEmbedded || !state.main.embedFeatures.includes('noMapSwitch'))
  ) {
    const baseLayer = integratedLayerDefs.find(
      (def) =>
        def.layer === 'base' &&
        def.key &&
        def.key[0] === event.code &&
        def.key[1] === event.shiftKey,
    );

    const baseLayerType =
      event.code.startsWith('Digit') && !event.shiftKey
        ? '.' + event.code.slice(5)
        : baseLayer && (!baseLayer.adminOnly || state.auth.user?.isAdmin)
          ? baseLayer.type
          : null;

    if (
      baseLayerType &&
      (baseLayerType.charAt(0) !== '.' ||
        state.map.customLayers.some(({ type }) => type === baseLayerType))
    ) {
      return mapRefocus({ mapType: baseLayerType });
    }

    const overlayLayer = integratedLayerDefs.find(
      (def) =>
        def.layer === 'overlay' &&
        def.key &&
        def.key[0] === event.code &&
        def.key[1] === event.shiftKey,
    );

    const overlayLayerType =
      event.code.startsWith('Digit') && event.shiftKey
        ? ':' + event.code.slice(5)
        : overlayLayer && (!overlayLayer.adminOnly || state.auth.user?.isAdmin)
          ? overlayLayer.type
          : null;

    if (
      overlayLayerType &&
      (overlayLayerType.charAt(0) !== ':' ||
        state.map.customLayers.some(({ type }) => type === overlayLayerType))
    ) {
      const next = new Set(state.map.layers);

      if (next.has(overlayLayerType)) {
        next.delete(overlayLayerType);
      } else {
        next.add(overlayLayerType);
      }

      return mapRefocus({ layers: [...next] });
    }
  }

  if (
    event.code === 'Delete' &&
    state.drawingLines.joinWith === undefined &&
    !keyTimer &&
    !showingModal &&
    !suspendedModal &&
    (state.main.selection?.type !== 'line-point' ||
      state.drawingLines.lines[state.main.selection.lineIndex].points.length >
        (state.drawingLines.lines[state.main.selection.lineIndex].type ===
        'line'
          ? 2
          : 3))
  ) {
    return deleteFeature();
  }

  if (showingModal || suspendedModal) {
    if (keyTimer) {
      window.clearTimeout(keyTimer);

      keyTimer = null;

      initCode = null;
    }

    return undefined;
  }

  if (
    !window.fmEmbedded &&
    !keyTimer &&
    (event.code === 'KeyG' ||
      event.code === 'KeyE' ||
      event.code === 'KeyP' ||
      event.code === 'KeyJ')
  ) {
    initCode = event.code;

    keyTimer = window.setTimeout(() => {
      keyTimer = null;

      initCode = null;
    }, 2000);

    return 'I';
  }

  if (keyTimer) {
    if (initCode === 'KeyG') {
      if (event.code === 'KeyC') {
        return clearMapFeatures();
      }

      if (event.code === 'KeyM') {
        return setActiveModal('maps');
      }

      const toolDefinition = toolDefinitions.find(
        (td) => td.kbd === event.code,
      );

      if (toolDefinition?.kbd) {
        return setTool(toolDefinition.tool);
      }

      return undefined;
    }

    if (initCode === 'KeyJ') {
      switch (event.code) {
        case 'KeyC':
          return openInExternalApp({ where: 'copy' });

        case 'KeyG':
          return openInExternalApp({ where: 'google' });

        case 'KeyJ':
          return openInExternalApp({ where: 'josm' });

        case 'KeyO':
          return openInExternalApp({ where: 'osm.org' });

        case 'KeyI':
          return openInExternalApp({ where: 'osm.org/id' });

        case 'KeyM':
          return openInExternalApp({ where: 'mapy.com' });

        case 'KeyH':
          return openInExternalApp({ where: 'hiking.sk' });

        case 'KeyZ':
          return openInExternalApp({ where: 'zbgis' });

        case 'KeyP':
          return openInExternalApp({ where: 'peakfinder' });

        case 'KeyL':
          return openInExternalApp({ where: 'mapillary' });

        case 'Digit4':
          return openInExternalApp({ where: 'f4map' });

        default:
          return undefined;
      }
    }

    if (initCode === 'KeyP') {
      switch (event.code) {
        case 'KeyL':
          return galleryList('-createdAt');

        case 'KeyU':
          return setActiveModal('gallery-upload');

        case 'KeyF':
          return setActiveModal('gallery-filter');

        default:
          return undefined;
      }
    }

    if (initCode === 'KeyE') {
      switch (event.code) {
        case 'KeyA':
          return setActiveModal('account');

        case 'KeyG':
          return setActiveModal('export-map-features');

        case 'KeyP':
          return setActiveModal('export-map');

        case 'KeyE':
          return setActiveModal('embed');

        case 'KeyD':
          return setActiveModal('drawing-properties');

        case 'KeyM':
          return setActiveModal('download-map');
      }

      return undefined;
    }
  }

  return undefined;
}

export function attachKeyboardHandler(store: MyStore): void {
  document.addEventListener('keydown', (e) => {
    const action = handleEvent(e, store.getState());

    if (action === 'I') {
      return;
    }

    if (keyTimer) {
      window.clearTimeout(keyTimer);

      keyTimer = null;

      initCode = null;
    }

    if (action) {
      store.dispatch(action);

      e.preventDefault();
    }
  });
}
