import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';
import { DefaultRootState } from 'react-redux';
import {
  drawingLineJoinStart,
  drawingLineStopDrawing,
} from './actions/drawingLineActions';
import { elevationChartClose } from './actions/elevationChartActions';
import {
  galleryCancelShowOnTheMap,
  galleryClear,
  galleryEditPicture,
  galleryList,
  galleryRequestImage,
  gallerySetItemForPositionPicking,
  galleryShowOnTheMap,
} from './actions/galleryActions';
import {
  clearMap,
  deleteFeature,
  openInExternalApp,
  selectFeature,
  setActiveModal,
  setSelectingHomeLocation,
  setTool,
} from './actions/mainActions';
import { mapRefocus } from './actions/mapActions';
import { showGalleryViewerSelector } from './selectors/mainSelectors';
import { MyStore } from './storeCreator';
import { toolDefinitions } from './toolDefinitions';

let keyTimer: number | null = null;

let initCode: 'KeyE' | 'KeyG' | 'KeyP' | 'KeyJ' | null = null;

function handleEvent(event: KeyboardEvent, state: DefaultRootState) {
  if (event.ctrlKey || event.altKey || event.metaKey || event.isComposing) {
    return 'I';
  }

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

  if (event.code === 'Escape') {
    if (
      document.querySelector('*[data-popper-reference-hidden=false]') !== null
    ) {
      return;
    }

    if (state.gallery.pickingPositionForId) {
      return gallerySetItemForPositionPicking(null);
    }

    if (showGalleryViewerSelector(state)) {
      if (state.gallery.editModel) {
        return galleryEditPicture();
      } else {
        return galleryClear();
      }
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
      // return (
      //   selectFeature(
      //     state.main.selection.type === 'tracking' ||
      //       state.main.selection.id === undefined
      //       ? null
      //       : { type: state.main.selection.type },
      //   ),
      // );

      return selectFeature(null);
    }

    if (!showingModal && !suspendedModal && state.main.tool) {
      return setTool(null);
    }

    return;
  }

  if (
    event.target instanceof HTMLElement &&
    ['input', 'select', 'textarea'].includes(event.target.tagName.toLowerCase())
  ) {
    return;
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
    const baseLayer = baseLayers.find(
      (l) => l.key && l.key[0] === event.code && l.key[1] === event.shiftKey,
    );

    if (baseLayer && (!baseLayer.adminOnly || state.auth.user?.isAdmin)) {
      return mapRefocus({ mapType: baseLayer.type });
    }

    const overlayLayer = overlayLayers.find(
      (l) => l.key && l.key[0] === event.code && l.key[1] === event.shiftKey,
    );

    if (overlayLayer && (!overlayLayer.adminOnly || state.auth.user?.isAdmin)) {
      const { type } = overlayLayer;

      const next = new Set(state.map.overlays);

      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }

      return mapRefocus({ overlays: [...next] });
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

    return;
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
        return clearMap();
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

      return;
    }

    if (initCode === 'KeyJ') {
      if (event.code === 'KeyC') {
        return openInExternalApp({ where: 'copy' });
      }

      if (event.code === 'KeyG') {
        return openInExternalApp({ where: 'google' });
      }

      if (event.code === 'KeyJ') {
        return openInExternalApp({ where: 'josm' });
      }

      if (event.code === 'KeyO') {
        return openInExternalApp({ where: 'osm.org' });
      }

      if (event.code === 'KeyI') {
        return openInExternalApp({ where: 'osm.org/id' });
      }

      if (event.code === 'KeyM') {
        return openInExternalApp({ where: 'mapy.cz' });
      }

      if (event.code === 'KeyF') {
        return openInExternalApp({ where: 'facebook' });
      }

      if (event.code === 'KeyT') {
        return openInExternalApp({ where: 'twitter' });
      }

      if (event.code === 'KeyH') {
        return openInExternalApp({ where: 'hiking.sk' });
      }

      if (event.code === 'KeyZ') {
        return openInExternalApp({ where: 'zbgis' });
      }

      if (event.code === 'KeyP') {
        return openInExternalApp({ where: 'peakfinder' });
      }

      if (event.code === 'KeyL') {
        return openInExternalApp({ where: 'mapillary' });
      }

      return;
    }

    if (initCode === 'KeyP') {
      if (event.code === 'KeyL') {
        return galleryList('-createdAt');
      }

      if (event.code === 'KeyU') {
        return setActiveModal('gallery-upload');
      }

      if (event.code === 'KeyF') {
        return setActiveModal('gallery-filter');
      }

      return;
    }

    if (initCode === 'KeyE') {
      switch (event.code) {
        case 'KeyA':
          return setActiveModal('account');
        case 'KeyG':
          return setActiveModal('export-gpx');
        case 'KeyP':
          return setActiveModal('export-pdf');
        case 'KeyE':
          return setActiveModal('embed');
      }

      return;
    }
  }
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
