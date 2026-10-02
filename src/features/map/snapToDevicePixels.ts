import type { Map as LeafletMap } from 'leaflet';

// At a fractional devicePixelRatio tile edges fall between device pixels, and
// `plus-lighter` overshoots where four meet: a bright dot on mid tones. A
// sub-pixel nudge of the map pane, below Leaflet's coordinate math, aligns them.
export function snapToDevicePixels(map: LeafletMap): () => void {
  const pane = map.getPane('mapPane');

  if (!pane) {
    return () => {};
  }

  const snap = () => {
    const dpr = window.devicePixelRatio || 1;

    // Only a container at rest: one mid-zoom is scaled off the grid.
    const tile = Array.from(
      pane.querySelectorAll<HTMLElement>('.leaflet-tile-container'),
    )
      .find((c) => c.style.transform.endsWith('scale(1)'))
      ?.querySelector<HTMLElement>('.leaflet-tile');

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

  let dprQuery: MediaQueryList | undefined;

  const watchDpr = () => {
    dprQuery?.removeEventListener('change', onDprChange);

    dprQuery = window.matchMedia(
      `(resolution: ${window.devicePixelRatio || 1}dppx)`,
    );

    dprQuery.addEventListener('change', onDprChange);
  };

  const onDprChange = () => {
    watchDpr();

    snap();
  };

  watchDpr();

  map.on('move zoomend viewreset resize', snap);

  map.on('layeradd', snapSoon);

  // The first layers are added before this runs, as child effects go first.
  snapSoon();

  return () => {
    map.off('move zoomend viewreset resize', snap);

    map.off('layeradd', snapSoon);

    dprQuery?.removeEventListener('change', onDprChange);

    cancelAnimationFrame(frame);

    pane.style.translate = '';
  };
}
