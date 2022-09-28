export function isEventOnMap(e: Event) {
  const { target } = e;

  return (
    target instanceof HTMLElement &&
    (target.classList.contains('leaflet-container') ||
      target.classList.contains('leaflet-gl-layer'))
  );
}
