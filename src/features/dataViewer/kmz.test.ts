import { strToU8, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { extractKmlFromKmz } from './kmz.js';

const KML =
  '<?xml version="1.0"?><kml><Document><name>Z</name></Document></kml>';

function kmz(files: Record<string, string>): ArrayBuffer {
  const zipped = zipSync(
    Object.fromEntries(
      Object.entries(files).map(([name, content]) => [name, strToU8(content)]),
    ),
  );

  return zipped.buffer.slice(
    zipped.byteOffset,
    zipped.byteOffset + zipped.byteLength,
  ) as ArrayBuffer;
}

describe('extractKmlFromKmz', () => {
  it('extracts doc.kml', async () => {
    const kml = await extractKmlFromKmz(kmz({ 'doc.kml': KML }));

    expect(kml).toBe(KML);
  });

  it('prefers doc.kml over other root .kml files and bundled resources', async () => {
    const kml = await extractKmlFromKmz(
      kmz({ 'images/pin.png': 'x', 'a.kml': '<other/>', 'doc.kml': KML }),
    );

    expect(kml).toBe(KML);
  });

  it('falls back to the first root-level .kml when no doc.kml', async () => {
    const kml = await extractKmlFromKmz(kmz({ 'b.kml': '<b/>', 'a.kml': KML }));

    expect(kml).toBe(KML);
  });

  it('returns null for a non-zip buffer', async () => {
    expect(await extractKmlFromKmz(strToU8('not a zip').buffer)).toBeNull();
  });

  it('returns null when the archive has no KML', async () => {
    expect(await extractKmlFromKmz(kmz({ 'readme.txt': 'hi' }))).toBeNull();
  });
});
