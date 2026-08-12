import { afterEach, expect, test, vi } from 'vitest';
import { wms, wmsBaseUrl } from './wms.js';

function serve(xml: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(xml, { status: 200 })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * A 1.3.0 document as served through a proxy that rewrites every `http://` to
 * `https://` — including the namespace declarations, which are identifiers
 * rather than addresses. The named layers sit under a group that declares no
 * CRS of its own and inherits it from the root.
 */
const PROXIED_1_3_0 = `<?xml version="1.0"?>
<WMS_Capabilities xmlns="https://www.opengis.net/wms" xmlns:xlink="https://www.w3.org/1999/xlink" version="1.3.0">
  <Service><Name>WMS</Name><Title>Cartografia</Title></Service>
  <Capability>
    <Request><GetMap><Format>image/png</Format></GetMap></Request>
    <Layer>
      <Title>Root</Title>
      <CRS>EPSG:4326</CRS>
      <CRS>EPSG:32632</CRS>
      <Layer>
        <Title>IGM 25.000</Title>
        <Layer queryable="1">
          <Name>CB.IGM25000.32</Name>
          <Title>Zona 32</Title>
          <Style><LegendURL><OnlineResource xlink:href="https://example.org/legend.png"/></LegendURL></Style>
        </Layer>
        <Layer>
          <Name>CB.IGM25000.33</Name>
          <Title>Zona 33</Title>
        </Layer>
      </Layer>
    </Layer>
  </Capability>
</WMS_Capabilities>`;

/** WMS 1.1.1: no namespace at all, `SRS` instead of `CRS`, codes in one element. */
const V1_1_1 = `<?xml version="1.0"?>
<WMT_MS_Capabilities version="1.1.1">
  <Service><Title>Old service</Title></Service>
  <Capability>
    <Layer>
      <Title>Root</Title>
      <SRS>EPSG:4326 EPSG:3857</SRS>
      <Layer><Name>old</Name><Title>Old layer</Title></Layer>
    </Layer>
  </Capability>
</WMT_MS_Capabilities>`;

/** The usual shape: standard namespace, CRS repeated on every child. */
const STANDARD = `<?xml version="1.0"?>
<WMS_Capabilities xmlns="http://www.opengis.net/wms" version="1.3.0">
  <Service><Title>Geologická mapa</Title></Service>
  <Capability>
    <Layer>
      <Title>Root</Title>
      <CRS>EPSG:4326</CRS>
      <Layer><Name>0</Name><Title>Zero</Title><CRS>EPSG:4326</CRS></Layer>
      <Layer><Name>1</Name><Title>One</Title><CRS>EPSG:4326</CRS></Layer>
    </Layer>
  </Capability>
</WMS_Capabilities>`;

/** A service whose whole map is the one requestable layer at the root. */
const NAMED_ROOT = `<?xml version="1.0"?>
<WMS_Capabilities xmlns="http://www.opengis.net/wms" version="1.3.0">
  <Service><Title>Single</Title></Service>
  <Capability>
    <Layer><Name>everything</Name><Title>Everything</Title><CRS>EPSG:3857</CRS></Layer>
  </Capability>
</WMS_Capabilities>`;

/** Nothing the map can draw. */
const UNSUPPORTED_CRS = `<?xml version="1.0"?>
<WMS_Capabilities xmlns="http://www.opengis.net/wms" version="1.3.0">
  <Service><Title>Local grid</Title></Service>
  <Capability>
    <Layer>
      <Title>Root</Title>
      <CRS>EPSG:3003</CRS>
      <Layer><Name>x</Name><Title>X</Title><CRS>EPSG:3003</CRS></Layer>
    </Layer>
  </Capability>
</WMS_Capabilities>`;

test('reads a proxied document whose namespace was rewritten to https', async () => {
  serve(PROXIED_1_3_0);

  const { title, layersTree } = await wms('https://example.org/wms');

  expect(title).toBe('Cartografia');

  // The group in between declares no CRS of its own and inherits it.
  expect(layersTree.map((l) => l.title)).toEqual(['IGM 25.000']);

  expect(layersTree[0].children.map((l) => l.name)).toEqual([
    'CB.IGM25000.32',
    'CB.IGM25000.33',
  ]);

  expect(layersTree[0].children[0].queryable).toBe(true);

  expect(layersTree[0].children[0].legendUrl).toBe(
    'https://example.org/legend.png',
  );
});

test('reads a 1.1.1 document, which carries no namespace and uses SRS', async () => {
  serve(V1_1_1);

  const { layersTree } = await wms('https://example.org/wms');

  expect(layersTree.map((l) => l.name)).toEqual(['old']);
});

test('lists the children of an unnamed root layer', async () => {
  serve(STANDARD);

  const { title, layersTree } = await wms('https://example.org/wms');

  expect(title).toBe('Geologická mapa');

  expect(layersTree.map((l) => l.name)).toEqual(['0', '1']);
});

test('offers the root layer itself when it is requestable', async () => {
  serve(NAMED_ROOT);

  const { layersTree } = await wms('https://example.org/wms');

  expect(layersTree.map((l) => l.name)).toEqual(['everything']);
});

test('drops layers in projections the map cannot draw', async () => {
  serve(UNSUPPORTED_CRS);

  const { layersTree } = await wms('https://example.org/wms');

  expect(layersTree).toEqual([]);
});

test('reports a response that is not XML instead of listing nothing', async () => {
  serve('<html><body>502 Bad Gateway<br></body></html>');

  await expect(wms('https://example.org/wms')).rejects.toThrow(/not XML/);
});

test('reports a service exception instead of listing nothing', async () => {
  serve(`<?xml version="1.0"?>
<ServiceExceptionReport version="1.3.0" xmlns="http://www.opengis.net/ogc">
  <ServiceException>Image size out of range</ServiceException>
</ServiceExceptionReport>`);

  await expect(wms('https://example.org/wms')).rejects.toThrow(
    /Image size out of range/,
  );
});

test('inherits the scale range from the parent layer', async () => {
  serve(`<?xml version="1.0"?>
<WMS_Capabilities xmlns="http://www.opengis.net/wms" version="1.3.0">
  <Service><Title>Scaled</Title></Service>
  <Capability>
    <Layer>
      <Title>Root</Title>
      <CRS>EPSG:3857</CRS>
      <MaxScaleDenominator>100000</MaxScaleDenominator>
      <Layer><Name>a</Name><Title>A</Title></Layer>
      <Layer>
        <Name>b</Name><Title>B</Title>
        <MaxScaleDenominator>50000</MaxScaleDenominator>
      </Layer>
    </Layer>
  </Capability>
</WMS_Capabilities>`);

  const { layersTree } = await wms('https://example.org/wms');

  expect(layersTree.map((l) => [l.name, l.maxScale])).toEqual([
    ['a', 100000],
    ['b', 50000],
  ]);
});

test('strips a request the service URL carries, keeping what identifies it', () => {
  // What the reporter pasted: the GetCapabilities URL, kept as the layer's
  // server URL, so every GetMap asked for GetCapabilities as well.
  expect(
    wmsBaseUrl('https://example.org/?SERVICE=WMS&REQUEST=GetCapabilities'),
  ).toBe('https://example.org/');

  // MapServer names the map file in the URL — that identifies the service.
  expect(
    wmsBaseUrl(
      'https://example.org/ogc?map=/ms_ogc/IGM.map&REQUEST=GetMap&BBOX=1,2,3,4&width=5',
    ),
  ).toBe('https://example.org/ogc?map=%2Fms_ogc%2FIGM.map');

  expect(wmsBaseUrl('not a url')).toBe('not a url');

  // Rendering hints survive unless the caller says it sets its own.
  expect(wmsBaseUrl('https://example.org/?dpi=200&REQUEST=GetMap')).toBe(
    'https://example.org/?dpi=200',
  );

  expect(wmsBaseUrl('https://example.org/?dpi=200', ['dpi'])).toBe(
    'https://example.org/',
  );

  // A layer that picked none of its own has only the URL's to go by.
  expect(wmsBaseUrl('https://example.org/?LAYERS=a&BBOX=1,2,3,4')).toBe(
    'https://example.org/?LAYERS=a',
  );

  expect(wmsBaseUrl('https://example.org/?LAYERS=a', ['layers'])).toBe(
    'https://example.org/',
  );
});

test('replaces the request parameters a pasted URL already carries', async () => {
  serve(STANDARD);

  await wms('https://example.org/wms?map=/x.map&SERVICE=WMS&REQUEST=GetMap');

  const url = new URL(vi.mocked(fetch).mock.calls[0][0] as string);

  expect(url.searchParams.get('map')).toBe('/x.map');

  expect([...url.searchParams.keys()].sort()).toEqual([
    'map',
    'request',
    'service',
    'version',
  ]);

  expect(url.searchParams.get('request')).toBe('GetCapabilities');
});
