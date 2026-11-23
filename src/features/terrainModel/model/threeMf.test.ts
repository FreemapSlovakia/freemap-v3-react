import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { buildMesh, meshTriangles } from './stl.js';
import { meshTo3mf, paintCode } from './threeMf.js';

const cols = 20;

const rows = 15;

const heights = Float32Array.from(
  { length: cols * rows },
  (_, i) => 100 + ((i * 7) % 13),
);

const classes = Uint8Array.from({ length: cols * rows }, (_, i) =>
  i % cols > 12 ? 1 : 0,
);

const mesh = buildMesh(
  heights,
  {
    cols,
    rows,
    widthMm: 40,
    depthMm: 30,
    mmPerM: 0.5,
    exaggeration: 1,
    baseMm: 2,
    toleranceMm: 0,
  },
  classes,
);

describe('meshTo3mf', async () => {
  const blob = await meshTo3mf(mesh, ['#f0f0f0', '#d32f2f'], {
    Title: 'Test & co',
  });

  const files = unzipSync(new Uint8Array(await blob.arrayBuffer()));

  const model = strFromU8(files['3D/3dmodel.model']!);

  it('packages the model', () => {
    expect(Object.keys(files).sort()).toEqual([
      '3D/3dmodel.model',
      '[Content_Types].xml',
      '_rels/.rels',
    ]);
  });

  it('holds every vertex and triangle', () => {
    expect(model.match(/<vertex /g)).toHaveLength(mesh.positions.length / 3);

    expect(model.match(/<triangle /g)).toHaveLength(meshTriangles(mesh));
  });

  it('colours each triangle from the palette', () => {
    expect(model).toContain('<m:color color="#F0F0F0FF"/>');

    expect(model).toContain('<m:color color="#D32F2FFF"/>');

    const p1 = [...model.matchAll(/ p1="(\d+)"/g)].map((m) => Number(m[1]));

    expect(p1).toEqual([...mesh.colours!]);
  });

  it('paints each triangle with its filament for Orca', () => {
    const paint = [...model.matchAll(/<triangle [^>]*/g)].map(
      (m) => / paint_color="(\w+)"/.exec(m[0])?.[1],
    );

    expect(paint).toEqual([...mesh.colours!].map((c) => (c ? '8' : undefined)));
  });

  it('escapes metadata', () => {
    expect(model).toContain('<metadata name="Title">Test &amp; co</metadata>');
  });
});

describe('paintCode', () => {
  it('encodes filaments as Orca serializes them', () => {
    expect([1, 2, 3, 4, 17, 18, 33, 34].map(paintCode)).toEqual([
      '4',
      '8',
      '0C',
      '1C',
      'EC',
      '0FC',
      'FFC',
      undefined,
    ]);
  });
});
