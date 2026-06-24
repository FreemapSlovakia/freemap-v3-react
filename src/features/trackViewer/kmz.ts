// Extracts the main KML document from a KMZ (ZIP) archive. Per the KMZ
// convention the entry point is the first root-level `.kml` file (usually
// `doc.kml`); referenced resources (icons, overlays) are ignored — we only need
// the geometry/styling. Returns null on a corrupt archive or when no KML is
// found. fflate is loaded lazily so it only ships when a KMZ is opened.
export async function extractKmlFromKmz(
  buffer: ArrayBuffer,
): Promise<string | null> {
  const { unzipSync } = await import('fflate');

  let entries: Record<string, Uint8Array>;

  try {
    entries = unzipSync(new Uint8Array(buffer));
  } catch {
    return null;
  }

  const names = Object.keys(entries);

  const isKml = (n: string) => n.toLowerCase().endsWith('.kml');

  const name =
    names.find((n) => n.toLowerCase() === 'doc.kml') ??
    names.filter((n) => !n.includes('/') && isKml(n)).sort()[0] ??
    names.filter(isKml).sort()[0];

  return name ? new TextDecoder('utf-8').decode(entries[name]) : null;
}
