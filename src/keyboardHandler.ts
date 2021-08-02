import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';
import {
  drawingLineJoinStart,
  drawingLineStopDrawing,
} from './actions/drawingLineActions';
import { elevationChartClose } from './actions/elevationChartActions';
import {
  galleryCancelShowOnTheMap,
  galleryClear,
  galleryEditPicture,
  galleryHideFilter,
  galleryHideUploadModal,
  galleryList,
  galleryRequestImage,
  gallerySetItemForPositionPicking,
  galleryShowFilter,
  galleryShowOnTheMap,
  galleryShowUploadModal,
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
import { tipsShow } from './actions/tipsActions';
import { showGalleryViewerSelector } from './selectors/mainSelectors';
import { MyStore } from './storeCreator';
import { toolDefinitions } from './toolDefinitions';

let keyTimer: number | null = null;

let initCode: 'KeyE' | 'KeyG' | 'KeyP' | 'KeyJ' | null = null;

export function attachKeyboardHandler(store: MyStore): void {
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.ctrlKey || event.altKey || event.metaKey || event.isComposing) {
      return;
    }

    const state = store.getState();

    const suspendedModal =
      state.main.selectingHomeLocation ||
      state.gallery.pickingPositionForId ||
      state.gallery.showPosition;

    const showingModal =
      state.gallery.showFilter ||
      !!state.main.activeModal ||
      state.gallery.showUploadModal ||
      state.gallery.activeImageId;
    //  ||
    // state.main.selectingHomeLocation ||
    // state.gallery.pickingPositionForId ||
    // state.gallery.showPosition;

    if (event.code === 'Escape') {
      if (
        document.querySelector('*[data-popper-reference-hidden=false]') !== null
      ) {
        // nothing
      } else if (state.gallery.showFilter) {
        store.dispatch(galleryHideFilter());
      } else if (state.gallery.pickingPositionForId) {
        store.dispatch(gallerySetItemForPositionPicking(null));
      } else if (state.gallery.showUploadModal) {
        store.dispatch(galleryHideUploadModal());
      } else if (showGalleryViewerSelector(state)) {
        if (state.gallery.editModel) {
          store.dispatch(galleryEditPicture());
        } else {
          store.dispatch(galleryClear());
        }

        event.preventDefault();
      } else if (state.elevationChart.elevationProfilePoints) {
        store.dispatch(elevationChartClose());
      } else if (state.drawingLines.joinWith) {
        store.dispatch(drawingLineJoinStart(undefined));
      } else if (state.drawingLines.drawing) {
        store.dispatch(drawingLineStopDrawing());
      } else if (state.main.selectingHomeLocation) {
        store.dispatch(setSelectingHomeLocation(false));
      } else if (state.gallery.showPosition) {
        store.dispatch(galleryCancelShowOnTheMap());
      } else if (!showingModal && !suspendedModal && state.main.selection) {
        // store.dispatch(
        //   selectFeature(
        //     state.main.selection.type === 'tracking' ||
        //       state.main.selection.id === undefined
        //       ? null
        //       : { type: state.main.selection.type },
        //   ),
        // );

        store.dispatch(selectFeature(null));

        event.preventDefault();
      } else if (!showingModal && !suspendedModal && state.main.tool) {
        store.dispatch(setTool(null));

        event.preventDefault();
      }

      return;
    }

    if (
      event.target &&
      ['input', 'select', 'textarea'].includes(
        (event.target as any).tagName.toLowerCase(),
      )
    ) {
      return;
    }

    if (showGalleryViewerSelector(state)) {
      if (event.code === 'KeyS') {
        store.dispatch(galleryShowOnTheMap());
        event.preventDefault();
        return;
      } else if (!state.gallery.editModel && event.code === 'KeyM') {
        store.dispatch(galleryEditPicture());
        event.preventDefault();
        return;
      }
    }

    if (
      showGalleryViewerSelector(state) &&
      state.gallery.imageIds &&
      state.gallery.imageIds.length > 1
    ) {
      if (event.code === 'ArrowLeft') {
        store.dispatch(galleryRequestImage('prev'));
        event.preventDefault();
        return;
      } else if (event.code === 'ArrowRight') {
        store.dispatch(galleryRequestImage('next'));
        event.preventDefault();
        return;
      }
    }

    if (
      state.main.activeModal === 'tips' &&
      state.tips.tip !== 'privacyPolicy'
    ) {
      if (event.code === 'ArrowLeft') {
        store.dispatch(tipsShow('prev'));
        event.preventDefault();
        return;
      } else if (event.code === 'ArrowRight') {
        store.dispatch(tipsShow('next'));
        event.preventDefault();
        return;
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

      if (
        baseLayer &&
        (!baseLayer.adminOnly || state.auth.user?.isAdmin) &&
        (!baseLayer.showOnlyInExpertMode || store.getState().main.expertMode)
      ) {
        store.dispatch(mapRefocus({ mapType: baseLayer.type }));

        event.preventDefault();

        return;
      }

      const overlayLayer = overlayLayers.find(
        (l) => l.key && l.key[0] === event.code && l.key[1] === event.shiftKey,
      );

      if (
        overlayLayer &&
        (!overlayLayer.adminOnly || state.auth.user?.isAdmin) &&
        (!overlayLayer.showOnlyInExpertMode || store.getState().main.expertMode)
      ) {
        const { type } = overlayLayer;

        const next = new Set(state.map.overlays);

        if (next.has(type)) {
          next.delete(type);
        } else {
          next.add(type);
        }

        store.dispatch(mapRefocus({ overlays: [...next] }));

        event.preventDefault();

        return;
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
      store.dispatch(deleteFeature());
    }

    if (showingModal || suspendedModal) {
      if (keyTimer) {
        window.clearTimeout(keyTimer);

        keyTimer = null;
        initCode = null;
      }
    } else if (
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
    } else if (keyTimer) {
      if (initCode === 'KeyG') {
        if (event.code === 'KeyC') {
          store.dispatch(clearMap());
          event.preventDefault();
          return;
        }

        if (event.code === 'KeyM') {
          store.dispatch(setActiveModal('maps'));
          event.preventDefault();
          return;
        }

        const toolDefinition = toolDefinitions.find(
          (td) => td.kbd === event.code,
        );

        if (toolDefinition?.kbd) {
          store.dispatch(setTool(toolDefinition.tool));
          event.preventDefault();
          return;
        }
      } else if (initCode === 'KeyJ') {
        if (event.code === 'KeyC') {
          store.dispatch(openInExternalApp({ where: 'copy' }));
          return;
        } else if (event.code === 'KeyG') {
          store.dispatch(openInExternalApp({ where: 'google' }));
          return;
        } else if (event.code === 'KeyJ') {
          store.dispatch(openInExternalApp({ where: 'josm' }));
          return;
        } else if (event.code === 'KeyO') {
          store.dispatch(openInExternalApp({ where: 'osm.org' }));
          return;
        } else if (event.code === 'KeyI') {
          store.dispatch(openInExternalApp({ where: 'osm.org/id' }));
          return;
        } else if (event.code === 'KeyM') {
          store.dispatch(openInExternalApp({ where: 'mapy.cz' }));
          return;
        } else if (event.code === 'KeyF') {
          store.dispatch(openInExternalApp({ where: 'facebook' }));
          return;
        } else if (event.code === 'KeyT') {
          store.dispatch(openInExternalApp({ where: 'twitter' }));
          return;
        } else if (event.code === 'KeyH') {
          store.dispatch(openInExternalApp({ where: 'hiking.sk' }));
          return;
        } else if (event.code === 'KeyZ') {
          store.dispatch(openInExternalApp({ where: 'zbgis' }));
          return;
        } else if (event.code === 'KeyP') {
          store.dispatch(openInExternalApp({ where: 'peakfinder' }));
          return;
        } else if (event.code === 'KeyL') {
          store.dispatch(openInExternalApp({ where: 'mapillary' }));
          return;
        }
      } else if (initCode === 'KeyP') {
        if (event.code === 'KeyL') {
          store.dispatch(galleryList('-createdAt'));
          return;
        } else if (event.code === 'KeyU') {
          store.dispatch(galleryShowUploadModal());
          return;
        } else if (event.code === 'KeyF') {
          store.dispatch(galleryShowFilter());
          return;
        }
      } else if (initCode === 'KeyE') {
        switch (event.code) {
          case 'KeyS':
            store.dispatch(setActiveModal('settings'));
            event.preventDefault();
            return;
          case 'KeyG':
            store.dispatch(setActiveModal('export-gpx'));
            event.preventDefault();
            return;
          case 'KeyP':
            store.dispatch(setActiveModal('export-pdf'));
            event.preventDefault();
            return;
          case 'KeyE':
            store.dispatch(setActiveModal('embed'));
            event.preventDefault();
            return;
        }
      }

      window.clearTimeout(keyTimer);
      keyTimer = null;
      initCode = null;
    }
  });
}
