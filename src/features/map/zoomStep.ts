/**
 * Where a `+`/`-` press lands from `zoom` — the on-screen buttons and the
 * keyboard both come here so they can't drift apart.
 *
 * The step is to the next whole level rather than a flat ±1, so the buttons
 * stay a way back to a clean, native tile zoom once a wheel or pinch gesture
 * has left the map between two of them. At a whole level it is a plain ±1.
 */
export function steppedZoom(zoom: number, direction: 1 | -1): number {
  const stepped = direction > 0 ? Math.floor(zoom + 1) : Math.ceil(zoom - 1);

  // `Math.ceil` answers -0 for anything between 0 and 1, and the whole-world
  // view is a zoom the `-` button can land on. It compares equal to 0 wherever
  // the store reads it, but there is no reason to keep it around.
  return stepped === 0 ? 0 : stepped;
}
