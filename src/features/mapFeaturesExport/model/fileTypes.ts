import { canShareFile } from '@shared/webShare.js';

export type ExportFileType = 'gpx' | 'geojson' | 'kml' | 'kmz';

// MIME type + save-dialog extensions per export file type. The type string
// doubles as the filename extension (`freemap-export-….<type>`).
export const FILE_META: Record<
  ExportFileType,
  { mime: string; exts: string[] }
> = {
  gpx: { mime: 'application/gpx+xml', exts: ['.gpx'] },
  geojson: { mime: 'application/geo+json', exts: ['.geojson', '.json'] },
  kml: { mime: 'application/vnd.google-earth.kml+xml', exts: ['.kml'] },
  kmz: { mime: 'application/vnd.google-earth.kmz', exts: ['.kmz'] },
};

export function exportFileName(type: ExportFileType): string {
  return `freemap-export-${new Date().toISOString()}.${type}`;
}

// Chromium checks shared files against a safelist of extensions (images, audio,
// video, PDF, plain text) in its browser process, which `canShare()` in the
// renderer cannot see: it answers `true` for a `.gpx` and `share()` then
// rejects with `NotAllowedError: Permission denied`. No geo format is on that
// safelist, so the engine itself is the test — and `userAgentData` is
// Chromium-only, so its presence identifies it.
const isChromium = 'userAgentData' in navigator;

const TEXT_MIME = 'text/plain';

/**
 * How this browser is willing to take an export of `type`: under its own name
 * and MIME type (`native`), only as plain text (`text`), or not at all
 * (`null` — it shares no files, like Firefox).
 *
 * The `text` mode is what makes sharing work on Chromium at all: the export
 * travels as `freemap-export-….gpx.txt`, so the bytes and the original extension
 * survive in the file name while the receiving app sees plain text.
 */
export function exportShareMode(
  type: ExportFileType,
): 'native' | 'text' | null {
  return !isChromium && canShareFile(`probe.${type}`, FILE_META[type].mime)
    ? 'native'
    : canShareFile('probe.txt', TEXT_MIME)
      ? 'text'
      : null;
}

/** The name and MIME type to share an export of `type` under. */
export function shareFileMeta(
  type: ExportFileType,
): { name: string; mime: string } | null {
  const mode = exportShareMode(type);

  const name = exportFileName(type);

  return mode === 'native'
    ? { name, mime: FILE_META[type].mime }
    : mode === 'text'
      ? { name: `${name}.txt`, mime: TEXT_MIME }
      : null;
}
