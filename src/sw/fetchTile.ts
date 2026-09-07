// how long a tile whose connection dropped waits before being asked for again
const TILE_RETRY_MS = 700;

/**
 * Fetches a tile, asking once more if the connection dropped under it — waking a
 * phone is the usual way. Worth the retry because an `<img>` handed an error
 * tile is never asked about again: Leaflet reloads it only once it has left the
 * viewport and come back. Only a *rejected* fetch is retried; a response that
 * arrived is the server's answer, whatever its status.
 */
export async function fetchTile(
  request: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(request, init);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, TILE_RETRY_MS));

    return fetch(request, init);
  }
}
