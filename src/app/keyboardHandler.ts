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
import { getMapLeafletElement } from '@features/map/hooks/leafletElementHolder.js';
import { mapRefocus, mapToggleLayer } from '@features/map/model/actions.js';
import { steppedZoom } from '@features/map/zoomStep.js';
import { mapAreaSelectCancel } from '@features/mapArea/model/actions.js';
import { toposcopeSetPickingCenter } from '@features/toposcope/model/actions.js';
import { integratedLayerDefs } from '@shared/mapDefinitions.js';
import { toolDefinitions } from '@shared/toolDefinitions.js';
import {
  clearMapFeatures,
  closeTool,
  deleteFeature,
  openInExternalApp,
  openTool,
  selectFeature,
  setActiveModal,
  setSelectingHomeLocation,
} from './store/actions.js';
import { isToolOpen, showGalleryViewerSelector } from './store/selectors.js';
import type { MyStore, RootState } from './store/store.js';

let keyTimer: number | null = null;

let initCode: 'KeyE' | 'KeyG' | 'KeyP' | 'KeyJ' | 'KeyM' | null = null;

export function handleEvent(event: KeyboardEvent, state: RootState) {
  const withModifiers =
    event.ctrlKey || event.altKey || event.metaKey || event.isComposing;

  const suspendedModal =
    state.homeLocation.selectingHomeLocation !== false ||
    state.gallery.pickingPositionForId ||
    state.gallery.showPosition ||
    state.mapArea.selecting ||
    state.toposcope.pickingCenter;

  // Overlays that own their open-state outside main.activeModal: the gallery
  // viewer (own + Wikimedia Commons photos), and the Wikipedia preview (shown
  // while loading or once previewed). The picking/selecting overlays are tracked
  // by `suspendedModal` instead.
  const showingModal =
    Boolean(state.main.activeModal) ||
    Boolean(state.gallery.activeImageId) ||
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

    // A modal in the foreground owns Escape: it closes itself on its own
    // document listener, which only fires while the key is not already claimed
    // — and this handler, registered first, would claim it. The picking
    // overlays hide their modal and leave the map live, so they keep the
    // dismissals below.
    if (showingModal && !suspendedModal) {
      return undefined;
    }

    // Before the panels and the selection: the map is in a mode of its own,
    // and leaving it is what Escape is for here.
    if (state.toposcope.pickingCenter) {
      return toposcopeSetPickingCenter(false);
    }

    if (state.elevationChart.target) {
      return elevationChartClose();
    }

    if (state.drawingLines.joinWith) {
      return drawingLineJoinStart(undefined);
    }

    // Waiting for a hole to be drawn is a mode of its own — no line is being
    // drawn yet — so leaving it must not fall through to clearing the
    // selection, which would drop the polygon the hole was meant for.
    if (
      state.drawingLines.drawing ||
      state.drawingLines.holeFor !== undefined
    ) {
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

    // Only the tool that owns map clicks: it is the one holding the map in a
    // mode, and Escape is for leaving a mode. The toolbar-only tools sit there
    // passively, several at a time, and are closed by their own button — one of
    // them going on an Escape aimed at something else would be a surprise.
    if (!showingModal && !suspendedModal && state.main.mapTool) {
      return closeTool(state.main.mapTool);
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

  if (showGalleryViewerSelector(state) && !state.gallery.editModel) {
    if (event.code === 'KeyS') {
      return galleryShowOnTheMap();
    }

    if (event.code === 'KeyM') {
      return galleryEditPicture();
    }
  }

  if (
    showGalleryViewerSelector(state) &&
    !state.gallery.editModel &&
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
        // The shortcut toggles, like the menu item it stands for.
        return isToolOpen(state, toolDefinition.tool)
          ? closeTool(toolDefinition.tool)
          : openTool(toolDefinition.tool);
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

        case 'KeyB':
          return setActiveModal({ type: 'browse-cache' });

        case 'KeyY':
          return setActiveModal({ type: 'map-layers-config' });

        case 'KeyC':
          return setActiveModal({ type: 'custom-maps' });

        case 'KeyL':
          return setActiveModal({ type: 'legend' });

        case 'KeyE':
          return setActiveModal({ type: 'elevation-settings' });
      }

      return undefined;
    }
  }

  return undefined;
}

const zoomKeyDirections: Record<string, 1 | -1> = {
  '+': 1,
  '=': 1,
  '-': -1,
  _: -1,
};

// Leaflet's own `keyboardPanDelta`, so the step is the size users of the
// focused map already know.
const PAN_PX = 80;

const panKeyOffsets: Record<string, [number, number]> = {
  ArrowLeft: [-PAN_PX, 0],
  ArrowRight: [PAN_PX, 0],
  ArrowUp: [0, -PAN_PX],
  ArrowDown: [0, PAN_PX],
};

/**
 * Moving the map with `+`/`-` and the arrow keys. Leaflet binds its own on the
 * map container, which only receives keys once the map has been clicked; going
 * through the store instead makes them work anywhere and matches what the
 * on-screen controls do. Holding shift triples an arrow step, as Leaflet does;
 * a zoom step ignores shift, because on most layouts `+` is typed as shift-`=`
 * and there is no telling that shift from a deliberate one.
 *
 * Routing a zoom through the store also means the store learns it before the
 * map does, which is what keeps GPS following alive across a zoom — whereas an
 * arrow key carries coordinates and so ends following, being a deliberate move
 * away from the located position.
 */
export function handleMapKey(event: KeyboardEvent, state: RootState) {
  const zoomDirection = zoomKeyDirections[event.key];

  const panOffset = panKeyOffsets[event.key];

  if (
    (!zoomDirection && !panOffset) ||
    event.ctrlKey ||
    event.altKey ||
    event.metaKey ||
    event.isComposing
  ) {
    return undefined;
  }

  if (
    event.target instanceof HTMLElement &&
    ['input', 'select', 'textarea'].includes(event.target.tagName.toLowerCase())
  ) {
    return undefined;
  }

  // An open dropdown moves its own selection with the arrow keys, and this
  // handler runs in the capture phase, so it would claim them before the menu
  // ever sees them. Same signal the Escape handling above uses.
  if (document.querySelector('*[aria-expanded=true]') !== null) {
    return undefined;
  }

  // The picking/selecting overlays leave the map live underneath, so moving it
  // stays available there; a real modal takes the keys — which is also what
  // leaves the gallery viewer its own arrow-key handling.
  const suspendedModal =
    state.homeLocation.selectingHomeLocation !== false ||
    state.gallery.pickingPositionForId ||
    state.gallery.showPosition ||
    state.mapArea.selecting;

  const showingModal =
    Boolean(state.main.activeModal) ||
    Boolean(state.gallery.activeImageId) ||
    Boolean(state.wiki.preview) ||
    Boolean(state.wiki.loading);

  if (showingModal && !suspendedModal) {
    return undefined;
  }

  const map = getMapLeafletElement();

  if (!map) {
    return undefined;
  }

  if (panOffset) {
    const step = event.shiftKey ? 3 : 1;

    // Panning starts from where the map actually is, not from the store, which
    // while following runs ahead of it.
    const mapZoom = map.getZoom();

    const { lat, lng } = map.unproject(
      map
        .project(map.getCenter(), mapZoom)
        .add([panOffset[0] * step, panOffset[1] * step]),
      mapZoom,
    );

    return mapRefocus({ lat, lon: lng });
  }

  const zoom = Math.min(
    map.getMaxZoom(),
    Math.max(map.getMinZoom(), steppedZoom(state.map.zoom, zoomDirection)),
  );

  return zoom === state.map.zoom ? undefined : mapRefocus({ zoom });
}

export function attachKeyboardHandler(store: MyStore): void {
  // Capture phase, so the key is claimed before it reaches the map container
  // and Leaflet's own handler moves the map a second time on top.
  document.addEventListener(
    'keydown',
    (e) => {
      const action = handleMapKey(e, store.getState());

      if (!action) {
        return;
      }

      store.dispatch(action);

      e.preventDefault();

      e.stopPropagation();

      // The document-level handler below never sees this key, so the pending
      // multi-key sequence it would have cancelled is cleared here instead.
      if (keyTimer) {
        window.clearTimeout(keyTimer);

        keyTimer = null;

        initCode = null;
      }
    },
    { capture: true },
  );

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
