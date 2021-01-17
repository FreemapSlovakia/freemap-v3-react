import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';
import {
  galleryClear,
  galleryEditPicture,
  galleryRequestImage,
  gallerySetItemForPositionPicking,
  galleryShowOnTheMap,
} from './actions/galleryActions';
import {
  clearMap,
  deleteFeature,
  selectFeature,
  setActiveModal,
  setSelectingHomeLocation,
} from './actions/mainActions';
import { mapRefocus } from './actions/mapActions';
import { tipsShow } from './actions/tipsActions';
import { showGalleryViewer } from './selectors/mainSelectors';
import { MyStore } from './storeCreator';
import { toolDefinitions } from './toolDefinitions';

let keyTimer: number | null = null;

let initCode: 'KeyE' | 'KeyG' | null = null;

const embed = window.self !== window.top;

export function attachKeyboardHandler(store: MyStore): void {
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.ctrlKey || event.altKey || event.metaKey || event.isComposing) {
      return;
    }

    const state = store.getState();

    const showingModal =
      !state.gallery.showPosition &&
      !state.gallery.pickingPositionForId &&
      !state.main.selectingHomeLocation &&
      (state.gallery.showFilter ||
        !!state.main.activeModal ||
        state.gallery.showUploadModal ||
        state.gallery.activeImageId);

    if (showGalleryViewer(state) && event.code === 'Escape') {
      if (state.gallery.editModel) {
        store.dispatch(galleryEditPicture());
      } else {
        store.dispatch(galleryClear());
      }
      event.preventDefault();
      return;
    }

    if (
      event.code === 'Escape' &&
      !embed &&
      !document.body.classList.contains('fm-overlay-backdrop-enable')
    ) {
      if (state.main.selectingHomeLocation) {
        store.dispatch(setSelectingHomeLocation(false));
        event.preventDefault();
        return;
      } else if (state.gallery.pickingPositionForId) {
        store.dispatch(gallerySetItemForPositionPicking(null));
        event.preventDefault();
        return;
      } else if (
        !showingModal &&
        !state.gallery.showPosition &&
        state.main.selection
      ) {
        store.dispatch(
          selectFeature(
            state.main.selection.id === undefined
              ? null
              : { type: state.main.selection.type },
          ),
        );
        event.preventDefault();
        return;
      }
    }

    if (
      event.target &&
      ['input', 'select', 'textarea'].includes(
        (event.target as any).tagName.toLowerCase(),
      )
    ) {
      return;
    }

    if (showGalleryViewer(state)) {
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
      showGalleryViewer(state) &&
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

    if (state.main.activeModal === 'tips') {
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
      !showingModal &&
      (!embed || !state.main.embedFeatures.includes('noMapSwitch'))
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
      !keyTimer &&
      !showingModal &&
      !state.gallery.showPosition &&
      !state.gallery.pickingPositionForId &&
      !state.main.selectingHomeLocation
    ) {
      if (event.code === 'Delete') {
        const { selection } = store.getState().main;
        if (selection) {
          store.dispatch(deleteFeature(selection));
        }
      }
    }

    if (
      state.main.activeModal ||
      state.gallery.showUploadModal ||
      state.main.selectingHomeLocation ||
      state.gallery.activeImageId ||
      state.gallery.showPosition ||
      state.gallery.pickingPositionForId
    ) {
      if (keyTimer) {
        window.clearTimeout(keyTimer);

        keyTimer = null;
        initCode = null;
      }
    } else if (
      !embed &&
      !keyTimer &&
      (event.code === 'KeyG' || event.code === 'KeyE')
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

        const toolDefinition = toolDefinitions.find(
          (td) => td.kbd === event.code,
        );

        if (toolDefinition?.kbd) {
          store.dispatch(selectFeature({ type: toolDefinition.tool }));
          event.preventDefault();
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
