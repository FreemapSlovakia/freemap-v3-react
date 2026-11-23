import { strToU8, Zip, ZipDeflate } from 'fflate';
import type { Mesh } from './stl.js';

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>
</Types>
`;

const RELS = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>
</Relationships>
`;

/** Vertices or triangles per string handed to the compressor. */
const CHUNK = 16384;

function escapeXml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * Filament `n` (1-based) as an unsplit triangle in the slicers' TriangleSelector
 * string: hex nibbles, last first; `n` ≥ 3 is "11" + (n − 3), or + F + (n − 18).
 * Past 33 the format has no code.
 */
export function paintCode(n: number): string | undefined {
  return n === 1
    ? '4'
    : n === 2
      ? '8'
      : n <= 17
        ? `${(n - 3).toString(16).toUpperCase()}C`
        : n <= 33
          ? `${(n - 18).toString(16).toUpperCase()}FC`
          : undefined;
}

/**
 * The mesh as a 3MF, each triangle in its palette colour through the materials
 * extension's `colorgroup`, which Bambu Studio maps to filaments on import.
 * Orca and its forks read only `paint_color`, the filament number, so it is
 * written too. Written in chunks: as one string a large model would not fit.
 */
export function meshTo3mf(
  mesh: Mesh,
  /** `#rrggbb` per palette index. */
  palette: string[],
  /** Standard 3MF metadata, such as `Title` or `Copyright`. */
  metadata: Record<string, string>,
): Promise<Blob> {
  const { promise, resolve, reject } = Promise.withResolvers<Blob>();

  const parts: Uint8Array<ArrayBuffer>[] = [];

  const zip = new Zip((err, chunk, final) => {
    if (err) {
      reject(err);

      return;
    }

    parts.push(chunk as Uint8Array<ArrayBuffer>);

    if (final) {
      resolve(new Blob(parts, { type: 'model/3mf' }));
    }
  });

  const small = (name: string, text: string) => {
    const file = new ZipDeflate(name, { level: 6 });

    zip.add(file);

    file.push(strToU8(text), true);
  };

  small('[Content_Types].xml', CONTENT_TYPES);

  small('_rels/.rels', RELS);

  const model = new ZipDeflate('3D/3dmodel.model', { level: 6 });

  zip.add(model);

  const push = (text: string) => model.push(strToU8(text));

  const { positions: p, index } = mesh;

  const colours = mesh.colours ?? new Uint8Array(index.length / 3);

  push(
    `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:m="http://schemas.microsoft.com/3dmanufacturing/material/2015/02">
${Object.entries(metadata)
  .map(
    ([name, value]) =>
      `<metadata name="${name}">${escapeXml(value)}</metadata>\n`,
  )
  .join('')}<resources>
<m:colorgroup id="1">
${palette.map((c) => `<m:color color="${c.toUpperCase()}FF"/>\n`).join('')}</m:colorgroup>
<object id="2" type="model" pid="1" pindex="0">
<mesh>
<vertices>
`,
  );

  const vertices = p.length / 3;

  for (let v0 = 0; v0 < vertices; v0 += CHUNK) {
    let s = '';

    for (let v = v0; v < Math.min(vertices, v0 + CHUNK); v++) {
      s += `<vertex x="${p[3 * v]!.toFixed(3)}" y="${p[3 * v + 1]!.toFixed(3)}" z="${p[3 * v + 2]!.toFixed(3)}"/>\n`;
    }

    push(s);
  }

  push('</vertices>\n<triangles>\n');

  const triangles = index.length / 3;

  // The ground, and filaments past the format, stay unpainted: filament 1.
  const paint = palette.map((_, i) => {
    const code = i ? paintCode(i + 1) : undefined;

    return code ? ` paint_color="${code}"` : '';
  });

  for (let t0 = 0; t0 < triangles; t0 += CHUNK) {
    let s = '';

    for (let t = t0; t < Math.min(triangles, t0 + CHUNK); t++) {
      s += `<triangle v1="${index[3 * t]}" v2="${index[3 * t + 1]}" v3="${index[3 * t + 2]}" pid="1" p1="${colours[t]}"${paint[colours[t]!] ?? ''}/>\n`;
    }

    push(s);
  }

  model.push(
    strToU8(`</triangles>
</mesh>
</object>
</resources>
<build>
<item objectid="2"/>
</build>
</model>
`),
    true,
  );

  zip.end();

  return promise;
}
