import {
  type Document,
  DocumentSchema,
} from '@features/documents/model/actions.js';
import z from 'zod';

const URL_MODAL_IDS = [
  'about',
  'account',
  'credits-purchase',
  'custom-maps',
  'drawing-properties',
  'embed',
  'file-import',
  'gallery-filter',
  'gallery-leaderboard',
  'gallery-upload',
  'legend',
  'login',
  'map-features-export',
  'map-layers-config',
  'map-preferences',
  'map-to-document-export',
  'my-maps',
  'offline-map-export',
  'offline-maps',
  'premium',
  'support-us',
  'tracking-my',
  'tracking-watched',
] as const;

export const UrlModalIdSchema = z.enum(URL_MODAL_IDS);

/** Legacy modal ids (from old shared links) mapped to their current name. */
const MODAL_RENAMES: Record<string, string> = {
  'export-map': 'map-to-document-export',
  'export-gpx': 'map-features-export',
  'export-map-features': 'map-features-export',
  'export-pdf': 'map-to-document-export',
  'download-map': 'offline-map-export',
  supportUs: 'support-us',
  mapSettings: 'map-layers-config',
  'map-settings': 'map-layers-config',
  'remove-ads': 'premium',
  'upload-track': 'file-import',
  'buy-credits': 'credits-purchase',
  maps: 'my-maps',
};

export const ModalIdSchema = z.enum([
  ...URL_MODAL_IDS,
  'current-drawing-properties',
  'track-viewer-style',
  'objects-style',
  'search-result-style',
]);

export type ModalId = z.infer<typeof ModalIdSchema>;

/**
 * The open modal/overlay. A discriminated union so a modal can carry an
 * argument (e.g. the document key or watched-device token). At most one is open
 * at a time. `null` means no modal.
 */
export type ActiveModal =
  | { type: Exclude<ModalId, 'tracking-watched' | 'my-maps'> }
  | { type: 'my-maps'; add?: boolean }
  | { type: 'tracking-watched'; token?: string }
  | { type: 'document'; key: Document }
  | { type: 'gallery-viewer'; id: number }
  | { type: 'wmc'; pageId: number }
  | { type: 'wiki'; key: string };

/**
 * Serializes the open modal to the packed `show=` value (`type` or `type/arg`),
 * or `null` when it has no URL representation. The literal `/` survives because
 * `serializeQuery` un-escapes `%2F`.
 */
export function encodeActiveModal(modal: ActiveModal | null): string | null {
  if (!modal) {
    return null;
  }

  switch (modal.type) {
    case 'tracking-watched':
      return modal.token
        ? `tracking-watched/${modal.token}`
        : 'tracking-watched';
    case 'document':
      return `document/${modal.key}`;
    case 'gallery-viewer':
      return `gallery-viewer/${modal.id}`;
    case 'wmc':
      return `wmc/${modal.pageId}`;
    case 'wiki':
      return `wiki/${modal.key}`;
    default:
      // Only URL-serializable ids go in `show=`; current-drawing-properties doesn't.
      return UrlModalIdSchema.safeParse(modal.type).success ? modal.type : null;
  }
}

/**
 * Parses a packed `show=` value (`type` or `type/arg`) into an `ActiveModal`,
 * applying legacy name renames. Returns `null` when nothing valid is named.
 */
export function decodeActiveModal(raw: string): ActiveModal | null {
  if (!raw) {
    return null;
  }

  const slash = raw.indexOf('/');

  const rawType = slash === -1 ? raw : raw.slice(0, slash);

  const arg = slash === -1 ? undefined : raw.slice(slash + 1);

  const type = MODAL_RENAMES[rawType] ?? rawType;

  switch (type) {
    case 'tracking-watched':
      return arg
        ? { type: 'tracking-watched', token: arg }
        : { type: 'tracking-watched' };
    case 'document': {
      const r = DocumentSchema.safeParse(arg);

      return r.success ? { type: 'document', key: r.data } : null;
    }
    case 'gallery-viewer': {
      const id = Number(arg);

      return arg && Number.isFinite(id) ? { type: 'gallery-viewer', id } : null;
    }
    case 'wmc': {
      const pageId = Number(arg);

      return arg && Number.isFinite(pageId) ? { type: 'wmc', pageId } : null;
    }
    case 'wiki':
      return arg ? { type: 'wiki', key: arg } : null;
    default: {
      const r = UrlModalIdSchema.safeParse(type);

      return r.success ? { type: r.data } : null;
    }
  }
}

/**
 * Wraps an arg-less modal named by a `ModalId` into an `ActiveModal`, for the
 * few call sites that open a modal chosen at runtime. The `tracking-watched`
 * and `my-maps` branches peel off the two members that carry an argument, so
 * the default branch's type matches the catch-all union member exactly —
 * TypeScript can't otherwise distribute a `ModalId`-typed discriminant across
 * the union members.
 */
export function modalOf(modalId: ModalId): ActiveModal {
  switch (modalId) {
    case 'tracking-watched':
      return { type: 'tracking-watched' };
    case 'my-maps':
      return { type: 'my-maps' };
    default:
      return { type: modalId };
  }
}
