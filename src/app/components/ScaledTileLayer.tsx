import { createTileLayerComponent } from '@react-leaflet/core';
import { noteTileCodes } from '@shared/tileAttribution.js';
import {
  markDrawnTile,
  pickTileScale,
  withTileScale,
} from '@shared/tileUrl.js';
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
  /** Whether this layer's tiles name the datasets they drew; see `loadTile`. */
  reportsAttribution?: boolean;
  premiumFromZoom?: number;
  premiumOnlyText?: string;
  onPremiumClick?: () => void;
};

/** What one tile's load owns, and how far it has got. */
type TileLoad = {
  /** The attempt in flight; a retry swaps it. */
  controller: AbortController;
  /** The `@Nx` that attempt asked for, which a decode failure has to know. */
  scale: number;
  objectUrl?: string;
  /** `done` has been called, so the tile is no longer loading. */
  reported: boolean;
  /** Unloaded or aborted: nothing wants it any more. */
  released: boolean;
};

const loads = new WeakMap<HTMLImageElement, TileLoad>();

function loading(img: HTMLImageElement): boolean {
  const load = loads.get(img);

  return load !== undefined && !load.reported && !load.released;
}

function revoke(load: TileLoad): void {
  if (load.objectUrl) {
    URL.revokeObjectURL(load.objectUrl);

    load.objectUrl = undefined;
  }
}

/** Drops what a tile holds: nothing wants its bytes or its request any more. */
function release(img: HTMLImageElement): void {
  const load = loads.get(img);

  if (load) {
    load.released = true;

    load.controller.abort();

    revoke(load);
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
   * The fetch is aborted and the object URL revoked on `tileunload` and on
   * `tileabort`: a pan or a zoom away from a tile still loading must not go on
   * paying for it.
   */
  private loadTile(
    img: HTMLImageElement,
    base: string,
    scale: number,
    done: DoneCallback,
  ): void {
    const load: TileLoad = {
      controller: new AbortController(),
      scale,
      reported: false,
      released: false,
    };

    loads.set(img, load);

    // Leaflet reads `complete` to ask whether a tile is still loading, and an
    // element given no `src` yet answers that it is not — so a zoom would leave
    // ours behind rather than dropping them. Answered from the load instead.
    Object.defineProperty(img, 'complete', {
      configurable: true,
      get: () => !loading(img),
    });

    const finish = (err?: Error) => {
      if (!load.reported) {
        load.reported = true;

        done(err, img);
      }
    };

    const { referrerPolicy } = this.options;

    const failed = (err: Error, at: number) => {
      // A provider with no `@Nx` of this tile answers the plain one, as
      // dropping `srcset` on error used to let the browser do — but not where a
      // scale was asked for outright, which had no such fallback either, and
      // where one transient failure would leave the tile blurry for good.
      if (at > 1 && this.forcedScale === undefined) {
        attempt(1);

        return;
      }

      // What Leaflet's `_tileOnError` would have done, the element no longer
      // loading through it.
      const { errorTileUrl } = this.options;

      if (errorTileUrl && img.src !== errorTileUrl) {
        img.src = errorTileUrl;
      }

      finish(err);
    };

    const attempt = (at: number) => {
      const url = markDrawnTile(withTileScale(base, at));

      // The `src` becomes an object URL, so what the tile was fetched from —
      // the key its codes are remembered under — is kept on the element.
      img.dataset['tileUrl'] = url;

      const controller = new AbortController();

      load.controller = controller;

      load.scale = at;

      fetch(url, {
        signal: controller.signal,
        // a tile is not what anyone is waiting on; the app's own calls are
        priority: 'low',
        ...(typeof referrerPolicy === 'string' && { referrerPolicy }),
      } as RequestInit)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`tile ${response.status}`);
          }

          noteTileCodes(url, response.headers);

          return response.blob();
        })
        .then((blob) => {
          // A body already buffered resolves even after the abort.
          if (load.controller !== controller || load.released) {
            return;
          }

          // a retry's bytes replace the attempt's before them
          revoke(load);

          load.objectUrl = URL.createObjectURL(blob);

          img.src = load.objectUrl;
        })
        .catch((err: Error) => {
          // Nothing to report on a tile Leaflet has already dropped — and
          // reporting it would raise `tileerror` for an ordinary pan, which a
          // native tile never does.
          if (load.released) {
            return;
          }

          if (load.controller !== controller) {
            finish(err);
          } else {
            failed(err, at);
          }
        });
    };

    // Bound once, not per attempt: a retry on the same element would otherwise
    // leave the first attempt's listeners armed and report the tile twice.
    img.addEventListener('load', () => finish());

    img.addEventListener('error', () => {
      // Revoking on release surfaces here too, on a tile nothing wants now.
      // The attempt's own scale, not the one asked for: the scale-1 retry
      // failing to decode would otherwise retry at 1 again, without end.
      if (loading(img)) {
        failed(new Error('tile did not decode'), load.scale);
      }
    });

    attempt(scale);
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
      this.loadTile(
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
        img.src = withTileScale(img.src, this.forcedScale);
      }
    } else if (this.extraScales?.length) {
      img.srcset = `${img.src}, ${this.extraScales
        .map((es) => `${withTileScale(img.src, es)} ${es}x`) // TODO add support for extensions
        .join(', ')}`;

      img.addEventListener(
        'error',
        () => {
          img.removeAttribute('srcset');
        },
        { once: true },
      );
    }

    // One writer for the key the credit is looked up by, as on the fetch path.
    img.dataset['tileUrl'] = img.src;

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
