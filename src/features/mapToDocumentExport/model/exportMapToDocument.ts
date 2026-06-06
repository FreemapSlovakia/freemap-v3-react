import type { RootState } from '@app/store/store.js';
import { buildExportFeatureCollection } from '@features/mapFeaturesExport/model/buildExportFeatureCollection.js';
import { COLORS } from '@shared/colors.js';
import z from 'zod';
import type { Exportable } from '@/features/mapFeaturesExport/model/actions.js';
import type { CustomLayerOrder, ExportableLayer, Format } from './types.js';

const fmMapserverUrl = process.env['FM_MAPSERVER_URL'];

export interface MapToDocumentExportParams {
  getState: () => RootState;
  /** Aborts the in-flight requests when the user cancels. */
  signal: AbortSignal;
  area: 'visible' | 'area';
  format: Format;
  /** Resolution in CSS pixels per map pixel (DPI / 96). */
  scale: number;
  /** Server-rendered raster overlays. */
  layers: ExportableLayer[];
  /** Own map-feature sources to draw on top. */
  exportables: Exportable[];
  customLayerOrder: CustomLayerOrder;
  decorations: {
    scaleBar: boolean;
    /** Localized cardinal letter to draw, or `false` to omit the north arrow. */
    northArrow: string | false;
    /** Resolved attribution text, or `false` to omit it. */
    attribution: string | false;
  };
  /** Glow/shadow around all custom-layer markers and lines, or `null`. */
  glow: { color: string; width: number } | null;
  label: { color: string; weight: number; size: number };
}

export interface MapToDocumentExportResult {
  blob: Blob;
  suggestedName: string;
}

/**
 * Renders the map to a document on the mapserver and returns the finished file.
 *
 * Bakes each point's marker into a self-contained `marker-svg` (icon + shape +
 * color), emits only the active route alternative and the tracking line without
 * per-sample markers, POSTs the export request, polls until the server has
 * finished rendering, then downloads the result as a blob.
 *
 * Resolves to `null` when there is no area to export. Throws on HTTP errors and
 * when aborted via `signal`.
 */
export async function exportMapToDocument({
  getState,
  signal,
  area,
  format,
  scale,
  layers,
  exportables,
  customLayerOrder,
  decorations,
  glow,
  label,
}: MapToDocumentExportParams): Promise<MapToDocumentExportResult | null> {
  const bbox =
    area === 'visible' ? getState().map.bounds : getState().mapArea.bbox;

  if (!bbox) {
    return null;
  }

  const exportableSet = new Set(exportables);

  const fc = await buildExportFeatureCollection({
    getState,
    include: {
      pictures: exportableSet.has('pictures'),
      drawingLines: exportableSet.has('drawingLines'),
      drawingAreas: exportableSet.has('drawingAreas'),
      drawingPoints: exportableSet.has('drawingPoints'),
      objects: exportableSet.has('objects'),
      plannedRoute: exportableSet.has('plannedRoute'),
      plannedRouteWithStops: exportableSet.has('plannedRouteWithStops'),
      tracking: exportableSet.has('tracking'),
      import: exportableSet.has('import'),
      search: exportableSet.has('search'),
    },
    pointMode: { svgMarker: true },
    options: {
      route: 'active',
      trackingPoints: false,
      lineColorFallback: COLORS.normal,
      lineWidthFallback: 4,
    },
  });

  window._paq.push(['trackEvent', 'MapExport', 'export', format]);

  const res = await fetch(`${fmMapserverUrl}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      bbox,
      zoom: getState().map.zoom,
      format,
      scale,
      decorations: {
        scaleBar: decorations.scaleBar, // bottom-left, metric, cos(lat)-corrected
        northArrow: decorations.northArrow, // top-right, static up-arrow + localized letter
        attribution: decorations.attribution, // bottom-right, right-aligned
      },
      features: {
        layers,
        customLayer: fc.features.length
          ? {
              featureCollection: fc,
              featureCollectionOrder: customLayerOrder,
              glowColor: glow ? glow.color : undefined, // rgba
              glowWidth: glow ? glow.width : 0,
              labelColor: label.color, // rgb (no alpha)
              labelWeight: label.weight,
              labelSize: label.size,
            }
          : undefined,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Unexpected HTTP response ${res.status}`);
  }

  const { token } = z.object({ token: z.string() }).parse(await res.json());

  const url = `${fmMapserverUrl}/export?token=${encodeURIComponent(token)}`;

  // Poll until the server has finished rendering the document.
  for (let i = 0; ; i++) {
    const t = Date.now();

    try {
      const head = await fetch(url, { method: 'HEAD', signal });

      if (!head.ok) {
        throw new Error(`Unexpected HTTP response ${head.status}`);
      }

      break;
    } catch (err) {
      if (signal.aborted || i > 10 || Date.now() - t < 15000) {
        throw err;
      }
    }
  }

  // Download the finished document.
  const fileRes = await fetch(url, { signal });

  if (!fileRes.ok) {
    throw new Error(`Unexpected HTTP response ${fileRes.status}`);
  }

  return {
    blob: await fileRes.blob(),
    suggestedName: `freemap-export.${format === 'jpeg' ? 'jpg' : format}`,
  };
}
