import { httpRequest } from '@app/httpRequest.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { isAbortError } from '@shared/isAbortError.js';
import z from 'zod';
import { loadGalleryMessages } from '../translations/loadGalleryMessages.js';
import { GalleryTagCompatSchema, gallerySetTags } from './actions.js';

type Ctx = Pick<
  Parameters<ProcessorHandler>[0],
  'getState' | 'dispatch' | 'toastError'
>;

/** The language of a load in flight. */
let pending: string | null = null;

/** A language whose quiet load failed, and when; not asked again quietly a while. */
let failed: { language: string; at: number } | null = null;

const RETRY_AFTER_MS = 5 * 60_000;

/** Whether a load is in flight; a language switch then asks again. */
export const tagsPending = () => pending !== null;

/**
 * Loads the tag list in the UI language. `refresh` (a modal opening): always,
 * for fresh counts, with an error shown. Else quietly, only for the labels:
 * not while loaded, in flight or failed for the language.
 */
export async function ensureTags(
  { getState, dispatch, toastError }: Ctx,
  refresh: boolean,
) {
  const { language } = getState().l10n;

  if (
    !refresh &&
    (getState().gallery.tagsLanguage === language ||
      pending === language ||
      (failed?.language === language &&
        Date.now() - failed.at < RETRY_AFTER_MS))
  ) {
    return;
  }

  pending = language;

  try {
    const tags = await httpRequest({
      getState,
      url: `/gallery/picture-tags?lang=${language}`,
      expectedStatus: 200,
    })
      .then(async (res) =>
        z.array(GalleryTagCompatSchema).parse(await res.json()),
      )
      .catch(async (err) => {
        if (refresh) {
          await toastError(err, loadGalleryMessages, 'tagsFetchingError');
        } else if (!isAbortError(err)) {
          failed = { language, at: Date.now() };
        }

        return null;
      });

    // Dropped when the language changed meanwhile, so a late answer can't
    // put back the labels of a language no longer shown.
    if (!tags || getState().l10n.language !== language) {
      return;
    }

    failed = null;

    dispatch(gallerySetTags({ tags, language }));
  } finally {
    if (pending === language) {
      pending = null;
    }
  }
}
