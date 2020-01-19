import {
  KEY_ESCAPE,
  KEY_LEFT,
  KEY_RIGHT,
  KEY_M,
  KEY_S,
  KEY_DELETE,
} from 'keycode-js';
import { MyStore } from './storeCreator';
import {
  selectFeature,
  setSelectingHomeLocation,
  setActiveModal,
  clearMap,
  deleteFeature,
} from './actions/mainActions';
import { showGalleryViewer } from './selectors/mainSelectors';
import {
  galleryRequestImage,
  gallerySetItemForPositionPicking,
  galleryShowOnTheMap,
  galleryEditPicture,
  galleryClear,
} from './actions/galleryActions';
import { tipsShow } from './actions/tipsActions';
import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';
import { mapRefocus } from './actions/mapActions';
import { toolDefinitions } from './toolDefinitions';

let keyTimer: number | null = null;
let initKey: 'e' | 'g' | null = null;

export function attachKeyboardHandler(store: MyStore) {
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    const embed = window.self !== window.top;

    if (event.ctrlKey || event.altKey || event.metaKey || event.isComposing) {
      return;
    }

    const state = store.getState();

    if (showGalleryViewer(state) && event.keyCode === KEY_ESCAPE) {
      if (state.gallery.editModel) {
        store.dispatch(galleryEditPicture());
      } else {
        store.dispatch(galleryClear());
      }
      event.preventDefault();
      return;
    }

    if (event.keyCode === KEY_ESCAPE && !embed) {
      if (state.main.selectingHomeLocation) {
        store.dispatch(setSelectingHomeLocation(false));
        event.preventDefault();
        return;
      } else if (state.gallery.pickingPositionForId) {
        store.dispatch(gallerySetItemForPositionPicking(null));
        event.preventDefault();
        return;
      } else if (
        !state.main.activeModal &&
        !state.gallery.activeImageId &&
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
      if (event.keyCode === KEY_S) {
        store.dispatch(galleryShowOnTheMap());
        event.preventDefault();
        return;
      } else if (!state.gallery.editModel && event.keyCode === KEY_M) {
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
      if (event.keyCode === KEY_LEFT) {
        store.dispatch(galleryRequestImage('prev'));
        event.preventDefault();
        return;
      } else if (event.keyCode === KEY_RIGHT) {
        store.dispatch(galleryRequestImage('next'));
        event.preventDefault();
        return;
      }
    }

    if (state.main.activeModal === 'tips') {
      if (event.keyCode === KEY_LEFT) {
        store.dispatch(tipsShow('prev'));
        event.preventDefault();
        return;
      } else if (event.keyCode === KEY_RIGHT) {
        store.dispatch(tipsShow('next'));
        event.preventDefault();
        return;
      }
    }

    if (
      !keyTimer &&
      !state.main.activeModal &&
      (!state.gallery.activeImageId ||
        state.gallery.showPosition ||
        state.gallery.pickingPositionForId) &&
      (!embed || !state.main.embedFeatures.includes('noMapSwitch'))
    ) {
      const baseLayer = baseLayers.find(l => l.key === event.key);
      if (baseLayer && (!baseLayer.adminOnly || state.auth.user?.isAdmin)) {
        store.dispatch(mapRefocus({ mapType: baseLayer.type }));
        event.preventDefault();
        return;
      }

      const overlayLayer = overlayLayers.find(l => l.key === event.key);
      if (
        overlayLayer &&
        (!overlayLayer.adminOnly || state.auth.user?.isAdmin)
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
      !state.main.activeModal &&
      !state.gallery.activeImageId &&
      !state.gallery.showPosition &&
      !state.gallery.pickingPositionForId &&
      !state.main.selectingHomeLocation
    ) {
      if (event.keyCode === KEY_DELETE) {
        const { selection } = store.getState().main;
        if (selection) {
          store.dispatch(deleteFeature(selection));
        }
      }
    }

    if (
      state.main.activeModal ||
      state.main.selectingHomeLocation ||
      state.gallery.activeImageId ||
      state.gallery.showPosition ||
      state.gallery.pickingPositionForId
    ) {
      if (keyTimer) {
        window.clearTimeout(keyTimer);

        keyTimer = null;
        initKey = null;
      }
    } else if (!keyTimer && (event.key === 'g' || event.key === 'e')) {
      initKey = event.key;

      keyTimer = window.setTimeout(() => {
        keyTimer = null;
        initKey = null;
      }, 2000);
    } else if (keyTimer) {
      if (initKey === 'g') {
        if (event.key === 'c') {
          store.dispatch(clearMap());
          event.preventDefault();
          return;
        }

        const toolDefinition = toolDefinitions.find(td => td.kbd === event.key);

        if (toolDefinition?.kbd) {
          store.dispatch(selectFeature({ type: toolDefinition.tool }));
          event.preventDefault();
          return;
        }
      } else if (initKey === 'e') {
        switch (event.key) {
          case 's':
            store.dispatch(setActiveModal('settings'));
            event.preventDefault();
            return;
          case 'g':
            store.dispatch(setActiveModal('export-gpx'));
            event.preventDefault();
            return;
          case 'p':
            store.dispatch(setActiveModal('export-pdf'));
            event.preventDefault();
            return;
          case 'e':
            store.dispatch(setActiveModal('embed'));
            event.preventDefault();
            return;
        }
      }

      window.clearTimeout(keyTimer);
      keyTimer = null;
      initKey = null;
    }
  });
}
