import { hasRole } from '@features/auth/model/types.js';
import {
  drawingLineJoinStart,
  drawingLineStopDrawing,
} from '@features/drawing/model/actions/drawingLineActions.js';
import { elevationChartClose } from '@features/elevationChart/model/actions.js';
import {
  galleryCancelShowOnTheMap,
  galleryClear,
  galleryEditPicture,
  galleryList,
  galleryRequestImage,
  gallerySetItemForPositionPicking,
  galleryShowOnTheMap,
} from '@features/gallery/model/actions.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import { mapAreaSelectCancel } from '@features/mapArea/model/actions.js';
import { integratedLayerDefs } from '@shared/mapDefinitions.js';
import { toolDefinitions } from '@shared/toolDefinitions.js';
import {
  clearMapFeatures,
  deleteFeature,
  openInExternalApp,
  selectFeature,
  setActiveModal,
  setSelectingHomeLocation,
  setTool,
  setTools,
} from './store/actions.js';
import { showGalleryViewerSelector } from './store/selectors.js';
import type { MyStore, RootState } from './store/store.js';

let keyTimer: number | null = null;

let initCode: 'KeyE' | 'KeyG' | 'KeyP' | 'KeyJ' | 'KeyM' | null = null;

function handleEvent(event: KeyboardEvent, state: RootState) {
  const withModifiers =
    event.ctrlKey || event.altKey || event.metaKey || event.isComposing;

  const suspendedModal =
    state.homeLocation.selectingHomeLocation !== false ||
    state.gallery.pickingPositionForId ||
    state.gallery.showPosition ||
    state.mapArea.selecting;

  // Overlays that own their open-state outside main.activeModal: the gallery
  // viewer, and the Wikimedia Commons / Wikipedia previews (each shown while
  // loading or once previewed). The picking/selecting overlays are tracked by
  // `suspendedModal` instead.
  const showingModal =
    Boolean(state.main.activeModal) ||
    Boolean(state.gallery.activeImageId) ||
    Boolean(state.wikimediaCommons.preview) ||
    Boolean(state.wikimediaCommons.loading) ||
    Boolean(state.wiki.preview) ||
    Boolean(state.wiki.loading);

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

    if (state.mapArea.selecting) {
      return mapAreaSelectCancel();
    }

    if (state.homeLocation.selectingHomeLocation !== false) {
      return setSelectingHomeLocation(false);
    }

    if (state.gallery.showPosition) {
      return galleryCancelShowOnTheMap();
    }

    if (!showingModal && !suspendedModal && state.main.selection) {
      return selectFeature(null);
    }

    // Back out gradually: first unfocus the active tool (keeping it open), then
    // on a further Esc close all open tools.
    if (!showingModal && !suspendedModal && state.main.activeTool) {
      return setTool({ tool: state.main.activeTool, mode: 'open' });
    }

    if (!showingModal && !suspendedModal && state.main.tools.length > 0) {
      return setTools([]);
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
    const layerDef = [...state.map.customLayers, ...integratedLayerDefs].find(
      (def) => {
        let shortcut = state.map.layersSettings[def.type]?.shortcut;

        if (shortcut === undefined) {
          shortcut = def.shortcut;
        }

        return (
          shortcut &&
          shortcut.code === event.code &&
          Boolean(shortcut.shift) === event.shiftKey &&
          Boolean(shortcut.ctrl) === event.ctrlKey &&
          Boolean(shortcut.alt) === event.altKey &&
          Boolean(shortcut.meta) === event.metaKey
        );
      },
    );

    const layerType =
      layerDef &&
      (!('layerPreview' in layerDef) ||
        !layerDef.layerPreview ||
        hasRole(state.auth.user, 'layerPreview'))
        ? layerDef.type
        : undefined;

    if (layerType) {
      return mapToggleLayer({ type: layerType });
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
      event.code === 'KeyJ' ||
      event.code === 'KeyM')
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
        return setActiveModal({ type: 'my-maps' });
      }

      const toolDefinition = toolDefinitions.find(
        (td) => td.kbd === event.code,
      );

      if (toolDefinition?.kbd) {
        return setTool({ tool: toolDefinition.tool, mode: 'activate' });
      }

      if (event.code === 'KeyW') {
        return setActiveModal({ type: 'tracking-watched' });
      }

      if (event.code === 'KeyD') {
        return setActiveModal({ type: 'tracking-my' });
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
          return setActiveModal({ type: 'gallery-upload' });

        case 'KeyF':
          return setActiveModal({ type: 'gallery-filter' });

        case 'KeyB':
          return setActiveModal({ type: 'gallery-leaderboard' });

        default:
          return undefined;
      }
    }

    if (initCode === 'KeyE') {
      switch (event.code) {
        case 'KeyA':
          return setActiveModal({ type: 'account' });

        case 'KeyG':
          return setActiveModal({ type: 'map-features-export' });

        case 'KeyP':
          return setActiveModal({ type: 'map-to-document-export' });

        case 'KeyE':
          return setActiveModal({ type: 'embed' });

        case 'KeyD':
          return setActiveModal({ type: 'drawing-properties' });

        case 'KeyM':
          return setActiveModal({ type: 'offline-map-export' });
      }

      return undefined;
    }

    if (initCode === 'KeyM') {
      switch (event.code) {
        case 'KeyP':
          return setActiveModal({ type: 'map-preferences' });

        case 'KeyO':
          return setActiveModal({ type: 'offline-maps' });

        case 'KeyY':
          return setActiveModal({ type: 'map-layers-config' });

        case 'KeyC':
          return setActiveModal({ type: 'custom-maps' });

        case 'KeyL':
          return setActiveModal({ type: 'legend' });
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
