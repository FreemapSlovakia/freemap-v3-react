export function isEventOnMap(e: Event) {
  const { target } = e;

  return (
    target instanceof HTMLElement &&
    (target.classList.contains('leaflet-container') ||
      target.classList.contains('leaflet-gl-layer') ||
      // A Leaflet canvas renderer passes a click on to the map only when none
      // of its paths took it.
      (target instanceof HTMLCanvasElement &&
        target.closest('.leaflet-map-pane') !== null))
  );
}
