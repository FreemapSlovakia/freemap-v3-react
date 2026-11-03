import { watchDevicePixelRatio } from '@shared/hooks/useDevicePixelRatio.js';
import type { Map as LeafletMap } from 'leaflet';
import { storeZoomOf } from './shiftZoomGrid.js';

// At a fractional devicePixelRatio tile edges fall between device pixels, and
// `plus-lighter` overshoots where four meet: a bright dot on mid tones. A
// sub-pixel nudge of the map pane, below Leaflet's coordinate math, aligns them.
export function snapToDevicePixels(map: LeafletMap): () => void {
  const pane = map.getPane('mapPane');

  // Without the CSS `translate` property (Chrome < 104) there is nothing to nudge.
  if (!pane || !('translate' in pane.style)) {
    return () => {};
  }

  const snap = () => {
    const dpr = window.devicePixelRatio || 1;

    // Only at rest on a level: mid-zoom, tiles are scaled off the grid.
    const tile = Number.isInteger(storeZoomOf(map))
      ? currentTile(pane)
      : undefined;

    if (Number.isInteger(dpr) || !tile) {
      pane.style.translate = '';

      return;
    }

    const [dx = 0, dy = 0] = pane.style.translate
      .split(' ')
      .map((v) => Number.parseFloat(v) || 0);

    const { left, top } = tile.getBoundingClientRect();

    const off = (v: number) => (Math.round(v * dpr) - v * dpr) / dpr;

    pane.style.translate = `${off(left - dx)}px ${off(top - dy)}px`;
  };

  // `layeradd` fires per marker too: one layout read per frame, not per layer.
  let frame = 0;

  const snapSoon = () => {
    frame ||= requestAnimationFrame(() => {
      frame = 0;

      snap();
    });
  };

  // Leaflet ends a zoom on a 250 ms timer, which can beat the tile containers'
  // CSS transition, so a snap at `zoomend` measures a tile still moving.
  const onTransitionEnd = (e: TransitionEvent) => {
    if (e.propertyName === 'transform') {
      snapSoon();
    }
  };

  const unwatchDpr = watchDevicePixelRatio(snap);

  map.on('move zoomend viewreset resize', snap);

  map.on('layeradd', snapSoon);

  pane.addEventListener('transitionend', onTransitionEnd);

  // The first layers are added before this runs, as child effects go first.
  snapSoon();

  return () => {
    map.off('move zoomend viewreset resize', snap);

    map.off('layeradd', snapSoon);

    pane.removeEventListener('transitionend', onTransitionEnd);

    unwatchDpr();

    cancelAnimationFrame(frame);

    pane.style.translate = '';
  };
}

// A tile of the first layer's current level: the one with the layer's highest
// z-index (they compare only within a layer), as one fading out is offset apart.
function currentTile(pane: HTMLElement): HTMLElement | undefined {
  for (const layer of pane.querySelectorAll('.leaflet-layer')) {
    let top: HTMLElement | undefined;

    for (const c of layer.children) {
      if (
        c instanceof HTMLElement &&
        c.classList.contains('leaflet-tile-container') &&
        (!top || Number(c.style.zIndex) > Number(top.style.zIndex))
      ) {
        top = c;
      }
    }

    const tile = top?.querySelector<HTMLElement>('.leaflet-tile');

    if (tile) {
      return tile;
    }
  }

  return undefined;
}
