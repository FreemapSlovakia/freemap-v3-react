import { createTileLayerComponent } from '@react-leaflet/core';
import { ATTRIBUTION_HEADER, noteTileCodes } from '@shared/tileAttribution.js';
import { pickTileScale, withTileScale } from '@shared/tileUrl.js';
import {
  type Coords,
  type DoneCallback,
  type TileEvent,
  TileLayer,
  type TileLayerOptions,
} from 'leaflet';
import type { TileLayerProps } from 'react-leaflet';

type Props = TileLayerProps & {
  extraScales?: number[];
  forcedScale?: number;
  cors?: boolean;
  /** Whether this layer's tiles name the datasets they drew; see `fetchTile`. */
  reportsAttribution?: boolean;
  premiumFromZoom?: number;
  premiumOnlyText?: string;
  onPremiumClick?: () => void;
};

const inFlight = new WeakMap<HTMLImageElement, AbortController>();

const objectUrls = new WeakMap<HTMLImageElement, string>();

/** Drops the bytes a tile holds. Its presence in `inFlight` is what says it is still wanted. */
function release(img: HTMLImageElement): void {
  inFlight.get(img)?.abort();

  inFlight.delete(img);

  revokeObjectUrl(img);
}

function revokeObjectUrl(img: HTMLImageElement): void {
  const objectUrl = objectUrls.get(img);

  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);

    objectUrls.delete(img);
  }
}

class LScaledTileLayer extends TileLayer {
  private extraScales;
  private forcedScale;
  private cors;
  private reportsAttribution;
  private premiumFromZoom;
  private premiumOnlyText;
  private onPremiumClick;

  constructor(
    urlTemplate: string,
    extraScales?: number[],
    forcedScale?: number,
    cors = true,
    reportsAttribution = false,
    premiumFromZoom?: number,
    premiumOnlyText?: string,
    onPremiumClick?: () => void,
    options?: TileLayerOptions,
  ) {
    super(urlTemplate, options);

    this.extraScales = extraScales;

    this.forcedScale = forcedScale;

    this.cors = cors;

    this.reportsAttribution = reportsAttribution;

    this.premiumFromZoom = premiumFromZoom;

    this.premiumOnlyText = premiumOnlyText;

    this.onPremiumClick = onPremiumClick;

    this.handlePremiumClick = this.handlePremiumClick.bind(this);

    // `tileabort` as well as `tileunload`: a zoom away from a tile still
    // decoding takes Leaflet's abort path, which removes the element without
    // ever announcing it as unloaded.
    this.on('tileunload tileabort', (event) => {
      release((event as TileEvent).tile as HTMLImageElement);
    });
  }

  handlePremiumClick(e: MouseEvent) {
    e.preventDefault();

    this.onPremiumClick?.();
  }

  /**
   * Loads a tile through `fetch` rather than by `src`, so the response — and
   * the datasets it names — can be read; the bytes then reach the element as an
   * object URL, which decodes exactly as any other image does. The element is
   * built here rather than by Leaflet, which would set `src` and fetch it twice.
   *
   * The object URL is revoked on `tileunload` and the fetch aborted with it: a
   * pan away from a tile still loading must not go on paying for it.
   */
  private fetchTile(
    img: HTMLImageElement,
    base: string,
    scale: number,
    done: DoneCallback,
  ): void {
    let settled = false;

    const finish = (err?: Error) => {
      if (!settled) {
        settled = true;

        // No longer loading, which is what `inFlight` marks — a tile that kept
        // its entry would read as pending and be dropped by `_abortLoading`.
        inFlight.delete(img);

        done(err, img);
      }
    };

    // What Leaflet's `_tileOnError` would have done, the element no longer
    // loading through it.
    const giveUp = (err: Error) => {
      const { errorTileUrl } = this.options;

      if (errorTileUrl && img.src !== errorTileUrl) {
        img.src = errorTileUrl;
      }

      finish(err);
    };

    let current = scale;

    const failed = (err: Error) => {
      // A provider with no `@Nx` of this tile answers the plain one, as
      // dropping `srcset` on error used to let the browser do — but not where a
      // scale was asked for outright, which had no such fallback either, and
      // where one transient failure would leave the tile blurry for good.
      if (current > 1 && this.forcedScale === undefined) {
        current = 1;

        attempt();
      } else {
        giveUp(err);
      }
    };

    // Bound once, not per attempt: a retry on the same element would otherwise
    // leave the first attempt's listeners armed and report the tile twice.
    img.addEventListener('load', () => finish());

    img.addEventListener('error', () => {
      // Revoking on unload surfaces here too, on a tile nothing wants any more
      // — retrying that would fetch for a detached element and leak what it got.
      if (!settled && inFlight.has(img)) {
        failed(new Error('tile did not decode'));
      }
    });

    const { referrerPolicy } = this.options;

    const attempt = () => {
      const url = withTileScale(base, current);

      // The `src` becomes an object URL, so what the tile was fetched from —
      // the key its codes are remembered under — is kept on the element.
      img.dataset['tileUrl'] = url;

      const abort = new AbortController();

      inFlight.set(img, abort);

      fetch(url, {
        signal: abort.signal,
        ...(typeof referrerPolicy === 'string' && { referrerPolicy }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`tile ${response.status}`);
          }

          noteTileCodes(url, response.headers.get(ATTRIBUTION_HEADER));

          return response.blob();
        })
        .then((blob) => {
          // A body already buffered resolves even after the abort, and by then
          // `release` has cleared what would have revoked this.
          if (inFlight.get(img) !== abort) {
            return;
          }

          // a retry's bytes replace the attempt's before them
          revokeObjectUrl(img);

          const objectUrl = URL.createObjectURL(blob);

          objectUrls.set(img, objectUrl);

          img.src = objectUrl;
        })
        .catch((err: Error) => {
          // Gone while this was in flight: the tile was unloaded, or a zoom
          // left it behind. Reported so the layer stops waiting on it, and not
          // retried — nothing would revoke what a retry produced.
          if (inFlight.get(img) !== abort) {
            finish(err);
          } else if (abort.signal.aborted) {
            inFlight.delete(img);

            finish(err);
          } else {
            failed(err);
          }
        });
    };

    attempt();
  }

  /**
   * Drops the tiles a zoom left behind, which Leaflet cannot: it acts only on an
   * element still loading, and ours has no `src` until its bytes arrive, so
   * `complete` is true and it would be skipped — left running, then reported
   * loaded and retained as a parent, which shows as a square that never fills.
   */
  _abortLoading(): void {
    const layer = this as unknown as {
      _tiles: Record<string, { el: HTMLImageElement; coords: Coords }>;
      _tileZoom?: number;
      fire(type: string, data: unknown): void;
    };

    for (const [key, tile] of Object.entries(layer._tiles)) {
      if (tile.coords.z !== layer._tileZoom && inFlight.has(tile.el)) {
        // Before the abort's rejection lands, so `_tileReady` finds it gone
        // rather than marking it loaded.
        delete layer._tiles[key];

        release(tile.el);

        tile.el.remove();

        layer.fire('tileabort', { tile: tile.el, coords: tile.coords });
      }
    }

    (
      TileLayer.prototype as unknown as { _abortLoading(): void }
    )._abortLoading.call(this);
  }

  createTile(coords: Coords, done: DoneCallback) {
    const isOnPremiumZoom =
      this.premiumFromZoom !== undefined && coords.z >= this.premiumFromZoom;

    if (isOnPremiumZoom && (coords.x + coords.y * 2) % 4) {
      const div = document.createElement('div');

      div.className = 'fm-nonpremium-tile';

      if (this.premiumOnlyText) {
        const a = document.createElement('a');

        a.href = '#show=premium';
        a.target = '_blank';
        a.innerText = this.premiumOnlyText;
        a.onclick = this.handlePremiumClick;

        div.appendChild(a);
      }

      setTimeout(() => done(undefined, div));

      return div;
    }

    // What the tile credits is only on the response that carried it, and an
    // `<img>` hands back none — so the bytes are fetched here and given to the
    // element as an object URL, which keeps the browser's own decode. Only for
    // the layers that report anything: a `fetch` asks with a different `Accept`
    // and `Sec-Fetch-Dest` than an image does, which some providers answer
    // differently or refuse outright, and it pins each tile's bytes in memory.
    if (this.reportsAttribution && this.cors) {
      const img = document.createElement('img');

      img.alt = '';

      img.classList.toggle('fm-demo-tile', isOnPremiumZoom);

      // `srcset` is what picked the `@Nx` variant by screen density when no
      // scale is forced; fetching one URL, the density is read here instead.
      this.fetchTile(
        img,
        this.getTileUrl(coords),
        this.forcedScale ?? pickTileScale(this.extraScales),
        done,
      );

      return img;
    }

    const img = super.createTile(coords, done) as HTMLImageElement;

    img.classList.toggle('fm-demo-tile', isOnPremiumZoom);

    if (this.cors) {
      img.crossOrigin = 'anonymous';
    }

    if (this.forcedScale !== undefined) {
      if (this.forcedScale > 1) {
        img.src += `@${this.forcedScale}x`;
      }
    } else if (this.extraScales?.length) {
      img.srcset = `${img.src}, ${this.extraScales
        .map((es) => `${img.src}@${es}x ${es}x`) // TODO add support for extensions
        .join(', ')}`;

      img.addEventListener(
        'error',
        () => {
          img.removeAttribute('srcset');
        },
        { once: true },
      );
    }

    return img;
  }
}

export const ScaledTileLayer = createTileLayerComponent<TileLayer, Props>(
  (props, context) => {
    const {
      url,
      extraScales,
      forcedScale,
      cors = true,
      reportsAttribution = false,
      premiumFromZoom,
      premiumOnlyText,
      onPremiumClick,
      // strict-origin-when-cross-origin (the modern browser default) so tile
      // providers that require a Referer header — e.g. OSM's usage policy —
      // aren't blocked even if a stricter document-level policy is in effect.
      referrerPolicy = 'strict-origin-when-cross-origin',
      ...rest
    } = props;

    return {
      instance: new LScaledTileLayer(
        url,
        extraScales,
        forcedScale,
        cors,
        reportsAttribution,
        premiumFromZoom,
        premiumOnlyText,
        onPremiumClick,
        { ...rest, referrerPolicy },
      ),
      context,
    };
  },

  (instance, props, prevProps) => {
    if (
      (
        [
          'url',
          'extraScales',
          'forcedScale',
          'cors',
          'reportsAttribution',
          'premiumFromZoom',
          'premiumOnlyText',
        ] as const
      ).some((p) => JSON.stringify(props[p]) !== JSON.stringify(prevProps[p]))
    ) {
      instance.redraw();
    }
  },
);
