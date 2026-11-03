import type { RootState } from '@app/store/store.js';
import type { Exportable } from '@features/mapFeaturesExport/model/actions.js';
import { buildExportFeatureCollection } from '@features/mapFeaturesExport/model/buildExportFeatureCollection.js';
import { COLORS } from '@shared/colors.js';
import { ATTRIBUTION_HEADER } from '@shared/tileAttribution.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import z from 'zod';
import { type ExportCredits, resolveExportCredits } from './exportCredits.js';
import { legendLabels, truncatedLabel } from './legendLabels.js';
import { type Bbox, bboxPixelSize } from './printScale.js';
import type {
  CustomLayerOrder,
  ExtraLayer,
  Format,
  OmittableLayer,
} from './types.js';

const fmMapserverUrl = process.env['FM_MAPSERVER_URL'];

export interface MapToDocumentExportParams {
  getState: () => RootState;
  /** Aborts the in-flight requests when the user cancels. */
  signal: AbortSignal;
  bbox: Bbox;
  /** Tile zoom whose detail the map is drawn with. */
  zoom: number;
  format: Format;
  /** Quality (0–100) for JPEG, and for WebP makes it lossy; `null` otherwise. */
  quality: number | null;
  /** Output pixels per map pixel; DPI / 96 unless the print is enlarged. */
  scale: number;
  /** Print density, which with `scale` sets the page's physical size. */
  dpi: number;
  /** Whether to draw the map itself, or only `layers` over transparency. */
  baseMap: boolean;
  /** Server-rendered layers added on top. */
  layers: ExtraLayer[];
  /** Base-map layers left out; only with `baseMap`. */
  omit: OmittableLayer[];
  /** Own map-feature sources to draw on top. */
  exportables: Exportable[];
  customLayerOrder: CustomLayerOrder;
  decorations: {
    scaleBar: boolean;
    /** Localized cardinal letter to draw, or `false` to omit the north arrow. */
    northArrow: string | false;
    /**
     * Asks for the attribution line, or `false` to omit it. The renderer
     * composes the text — only it knows which datasets it drew from — so this
     * carries just what it cannot arrive at: `extra`, whatever the exported
     * features earn, and `titles`, the credits the app words itself.
     */
    attribution: { extra: string[]; titles: Record<string, string> } | false;
    /** The legend panel's title, or `false` to omit the panel. */
    legend: { title: string } | false;
  };
  /** Glow/shadow around all custom-layer markers and lines, or `null`. */
  glow: { color: string; width: number } | null;
  label: { color: string; weight: number; size: number };
}

/** The area holds more pixels at the chosen zoom than the renderer accepts. */
export class ExportTooLargeError extends Error {
  constructor(
    /** The highest zoom at which the area fits. */
    readonly fittingZoom: number,
  ) {
    super('export too large');
  }
}

const TooLargeSchema = z.object({
  error: z.literal('export_too_large'),
  maxPixels: z.number(),
});

export interface MapToDocumentExportResult extends ExportCredits {
  blob: Blob;
  suggestedName: string;
}

/**
 * Renders the map to a document on the mapserver and returns the finished file
 * along with the credits it has to be displayed with.
 *
 * Bakes each point's marker into a self-contained `marker-svg` (icon + shape +
 * color), emits only the active route alternative and the tracking line without
 * per-sample markers, POSTs the export request, polls until the server has
 * finished rendering, then downloads the result as a blob and releases the job.
 *
 * Throws on HTTP errors and when aborted via `signal`.
 */
export async function exportMapToDocument({
  getState,
  signal,
  bbox,
  zoom,
  format,
  quality,
  scale,
  dpi,
  baseMap,
  layers,
  omit,
  exportables,
  customLayerOrder,
  decorations,
  glow,
  label,
}: MapToDocumentExportParams): Promise<MapToDocumentExportResult> {
  const exportableSet = new Set(exportables);

  const fcPromise = buildExportFeatureCollection({
    getState,
    include: {
      pictures: exportableSet.has('pictures'),
      drawingLines: exportableSet.has('drawingLines'),
      drawingAreas: exportableSet.has('drawingAreas'),
      drawingPoints: exportableSet.has('drawingPoints'),
      objects: exportableSet.has('objects'),
      plannedRoute: exportableSet.has('plannedRoute'),
      tracking: exportableSet.has('tracking'),
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

  const [fc, legendLabelsResult] = await Promise.all([
    fcPromise,
    decorations.legend && legendLabels(getState().l10n.language, signal),
  ]);

  signal.throwIfAborted();

  const legend = decorations.legend &&
    legendLabelsResult && {
      title: truncatedLabel(decorations.legend.title),
      ...legendLabelsResult,
    };

  // WebP's two are separate codecs rather than one with a knob, and the
  // renderer names them apart.
  const wireFormat =
    format === 'webp' && quality !== null ? 'webp-lossy' : format;

  trackMatomo(['trackEvent', 'DocumentExport', 'export', wireFormat]);

  const res = await fetch(`${fmMapserverUrl}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      bbox,
      zoom,
      format: wireFormat,
      quality: quality ?? undefined,
      scale,
      dpi,
      decorations: {
        scaleBar: decorations.scaleBar, // bottom-left, metric, cos(lat)-corrected
        // top-right, static up-arrow + localized letter; omitted, never `false`,
        // which the renderer's `Option<String>` would reject outright
        northArrow: decorations.northArrow || undefined,
        // bottom-right, right-aligned; the renderer appends its own datasets
        attribution: decorations.attribution || undefined,
        // beside the map, widening the image; lists only what was drawn
        legend: legend || undefined,
      },
      features: {
        baseMap,
        layers,
        omit: baseMap && omit.length ? omit : undefined,
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

  // A body over the server's upload limit is a 413 too, without this JSON.
  if (res.status === 413) {
    const tooLarge = TooLargeSchema.safeParse(
      await res.json().catch(() => null),
    );

    if (tooLarge.success) {
      // The renderer counts a legend as a second map's width.
      const factor = legend ? 2 : 1;

      // Measured as the renderer does, as its rounding can push a zoom over.
      let fitting = zoom - 1;

      for (; fitting >= 0; fitting--) {
        const size = bboxPixelSize(bbox, fitting);

        if (size.width * size.height * factor <= tooLarge.data.maxPixels) {
          break;
        }
      }

      throw new ExportTooLargeError(fitting);
    }
  }

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

  const blob = await fileRes.blob();

  // The bytes are in hand, so the server has nothing left to keep. Its own
  // retention sweep is the backstop for a client that never gets this far.
  void fetch(url, { method: 'DELETE' }).catch(() => undefined);

  return {
    blob,
    suggestedName: `freemap-export.${format === 'jpeg' ? 'jpg' : format}`,
    ...(await resolveExportCredits(fileRes.headers.get(ATTRIBUTION_HEADER))),
  };
}
